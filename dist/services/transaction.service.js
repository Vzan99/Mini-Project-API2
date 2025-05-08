"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransactionService = CreateTransactionService;
exports.PaymentTransactionService = PaymentTransactionService;
exports.EOActionTransactionService = EOActionTransactionService;
exports.AutoExpireTransactionService = AutoExpireTransactionService;
exports.AutoCancelTransactionService = AutoCancelTransactionService;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const cloudinary_1 = require("../utils/cloudinary");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const nodemailer_1 = require("../utils/nodemailer");
//Create Transaction (Click "BuyTicket" Button from event details page)
function CreateTransactionService(param) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userId, eventId, quantity, couponId, voucherId, pointsId } = param;
        // 1. Fetch Event & User
        const [event, user] = yield Promise.all([
            prisma_1.default.event.findUnique({ where: { id: eventId } }),
            prisma_1.default.user.findUnique({ where: { id: userId } }),
        ]);
        if (!event)
            throw new Error("Event not found");
        if (!user)
            throw new Error("User not found");
        // 2. Check seat availability
        if (event.remaining_seats < quantity) {
            throw new Error("Not enough seats available");
        }
        const now = new Date();
        // 3. Gather discounts
        let couponDiscount = 0;
        let voucherDiscount = 0;
        let pointsDiscount = 0;
        // 3a. Coupon
        if (couponId) {
            const coupon = yield prisma_1.default.coupon.findUnique({ where: { id: couponId } });
            if (!coupon ||
                coupon.user_id !== userId ||
                now < coupon.coupon_start_date ||
                now > coupon.coupon_end_date ||
                coupon.use_count >= coupon.max_usage) {
                throw new Error("Invalid or expired coupon");
            }
            couponDiscount = coupon.discount_amount;
        }
        // 3b. Voucher
        if (voucherId) {
            const voucher = yield prisma_1.default.voucher.findUnique({
                where: { id: voucherId },
            });
            if (!voucher ||
                voucher.event_id !== eventId ||
                now < voucher.voucher_start_date ||
                now > voucher.voucher_end_date ||
                voucher.usage_amount >= voucher.max_usage) {
                throw new Error("Invalid or expired voucher");
            }
            voucherDiscount = voucher.discount_amount;
        }
        // 3c. Points
        if (pointsId) {
            const points = yield prisma_1.default.points.findUnique({ where: { id: pointsId } });
            if (!points ||
                points.user_id !== userId ||
                points.is_used ||
                points.is_expired ||
                now > points.expires_at) {
                throw new Error("Invalid or expired points");
            }
            pointsDiscount = points.points_amount;
        }
        // 4. Calculate payment
        const originalAmount = event.price * quantity;
        const totalDiscount = couponDiscount + voucherDiscount + pointsDiscount;
        const finalAmount = Math.max(0, originalAmount - totalDiscount);
        // 5. Determine initial status & expiration
        let status;
        let expiresAt;
        if (event.price === 0) {
            status = client_1.transaction_status.confirmed;
            expiresAt = now; // immediate
        }
        else {
            status = client_1.transaction_status.waiting_for_payment;
            expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
        }
        // 6. Create transaction + side effects in one atomic call
        const tx = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
            // 6a. Create transaction
            const transaction = yield tx.transaction.create({
                data: {
                    user_id: userId,
                    event_id: eventId,
                    quantity,
                    unit_price: event.price,
                    total_pay_amount: finalAmount,
                    payment_proof: null,
                    status,
                    expires_at: expiresAt,
                    coupon_id: couponId !== null && couponId !== void 0 ? couponId : undefined,
                    voucher_id: voucherId !== null && voucherId !== void 0 ? voucherId : undefined,
                    points_id: pointsId !== null && pointsId !== void 0 ? pointsId : undefined,
                },
            });
            // 6b. Decrement seats
            yield tx.event.update({
                where: { id: eventId },
                data: { remaining_seats: event.remaining_seats - quantity },
            });
            // 6c. Increment coupon usage
            if (couponId) {
                yield tx.coupon.update({
                    where: { id: couponId },
                    data: { use_count: { increment: 1 } },
                });
            }
            // 6d. Increment voucher usage
            if (voucherId) {
                yield tx.voucher.update({
                    where: { id: voucherId },
                    data: { usage_amount: { increment: 1 } },
                });
            }
            // 6e. Mark points used
            if (pointsId) {
                yield tx.points.update({
                    where: { id: pointsId },
                    data: {
                        is_used: true,
                    },
                });
            }
            return transaction;
        }));
        return tx;
    });
}
//Customer upload Payment Proof, and then change the status to "waiting_for_admin_confirmation"
function PaymentTransactionService(_a) {
    return __awaiter(this, arguments, void 0, function* ({ transactionId, userId, file, }) {
        let url = "";
        try {
            // 1. Get the transaction
            const tx = yield prisma_1.default.transaction.findUnique({
                where: { id: transactionId },
            });
            if (!tx) {
                throw new Error("Transaction not found");
            }
            // 2. Check ownership
            if (tx.user_id !== userId) {
                throw new Error("You are not authorized to confirm this transaction");
            }
            // 3. Must be in the correct status
            if (tx.status !== client_1.transaction_status.waiting_for_payment) {
                throw new Error("Transaction is not awaiting payment");
            }
            // 4. Check if expired
            if (tx.expires_at && tx.expires_at < new Date()) {
                yield prisma_1.default.transaction.update({
                    where: { id: transactionId },
                    data: { status: client_1.transaction_status.expired },
                });
                throw new Error("Transaction has expired");
            }
            // 5. Upload to Cloudinary
            const { secure_url } = yield (0, cloudinary_1.cloudinaryUpload)(file);
            url = secure_url;
            const splitUrl = secure_url.split("/");
            const fileName = splitUrl[splitUrl.length - 1];
            // 6. Wrap database update inside $transaction
            const updatedTx = yield prisma_1.default.$transaction((txClient) => __awaiter(this, void 0, void 0, function* () {
                // Update transaction with payment proof and status inside the transaction
                const updatedTransaction = yield txClient.transaction.update({
                    where: { id: transactionId },
                    data: {
                        payment_proof: fileName, // Save the secure URL in the database
                        status: client_1.transaction_status.waiting_for_admin_confirmation,
                        updated_at: new Date(),
                    },
                });
                return updatedTransaction;
            }));
            return updatedTx;
        }
        catch (err) {
            if (url)
                yield (0, cloudinary_1.cloudinaryRemove)(url);
            throw err;
        }
    });
}
//Event Organizer Action Confirm or Reject
function EOActionTransactionService(param) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { transactionId, userId, action } = param;
            // Fetch the transaction along with its event to ensure the EO is authorized to act
            const transaction = yield prisma_1.default.transaction.findUnique({
                where: { id: transactionId },
                include: {
                    event: true,
                    user: {
                        select: {
                            username: true,
                            email: true,
                        },
                    },
                },
            });
            if (!transaction)
                throw new Error("Transaction not found");
            const event = transaction.event;
            // Ensure the transaction belongs to the correct event organizer
            if (event.organizer_id !== userId) {
                throw new Error("You are not authorized to modify this transaction");
            }
            // Check the current status of the transaction
            if (transaction.status !== client_1.transaction_status.waiting_for_admin_confirmation) {
                throw new Error("Transaction status is not waiting for admin confirmation");
            }
            // Use the action from the enum directly
            let updatedStatus;
            if (action === client_1.transaction_status.confirmed ||
                action === client_1.transaction_status.rejected) {
                updatedStatus = action; // Directly using the action from the enum
            }
            else {
                throw new Error("Invalid action");
            }
            // If rejecting, perform rollback in a transaction
            if (updatedStatus === client_1.transaction_status.rejected) {
                return yield prisma_1.default.$transaction((txClient) => __awaiter(this, void 0, void 0, function* () {
                    // a) Restore seats
                    yield txClient.event.update({
                        where: { id: transaction.event_id },
                        data: { remaining_seats: { increment: transaction.quantity } },
                    });
                    // b) Refund coupon usage
                    if (transaction.coupon_id) {
                        yield txClient.coupon.update({
                            where: { id: transaction.coupon_id },
                            data: { use_count: { decrement: 1 } },
                        });
                    }
                    // c) Refund voucher usage
                    if (transaction.voucher_id) {
                        yield txClient.voucher.update({
                            where: { id: transaction.voucher_id },
                            data: { usage_amount: { decrement: 1 } },
                        });
                    }
                    // d) Mark points unused
                    if (transaction.points_id) {
                        yield txClient.points.update({
                            where: { id: transaction.points_id },
                            data: { is_used: false },
                        });
                    }
                    // e) Update the transaction status
                    const updatedTransaction = yield txClient.transaction.update({
                        where: { id: transactionId },
                        data: {
                            status: updatedStatus,
                            updated_at: new Date(),
                        },
                    });
                    // d) Send email to customer
                    const emailTemplatePatch = path_1.default.join(__dirname, "../templates", "ticketRejected.template.hbs");
                    const templateSource = fs_1.default.readFileSync(emailTemplatePatch, "utf8");
                    const compiledEmailTemplate = Handlebars.compile(templateSource);
                    const htmlContent = compiledEmailTemplate({
                        username: transaction.user.username,
                        eventName: transaction.event.name,
                        transactionId: transaction.id,
                        rejectionReason: "Your transaction has been rejected",
                    });
                    yield nodemailer_1.transporter.sendMail({
                        from: '"Ticket Admin" <no-reply@yourdomain.com>',
                        to: transaction.user.email,
                        subject: "Transaction Rejected",
                        html: htmlContent,
                    });
                    return updatedTransaction;
                }));
            }
            else {
                // For confirmation, just update the status
                const updatedTransaction = yield prisma_1.default.transaction.update({
                    where: { id: transactionId },
                    data: {
                        status: updatedStatus,
                        updated_at: new Date(),
                    },
                });
                return updatedTransaction;
            }
        }
        catch (err) {
            throw err;
        }
    });
}
// Expire Transactions that have not received payment proof within 2 hours
function AutoExpireTransactionService() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("function auto expire berjalan");
            yield prisma_1.default.transaction.updateMany({
                where: {
                    status: client_1.transaction_status.waiting_for_payment,
                    expires_at: { lt: new Date() },
                },
                data: {
                    status: client_1.transaction_status.expired,
                },
            });
        }
        catch (err) {
            throw err;
        }
    });
}
function AutoCancelTransactionService() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("function auto cancel berjalan");
            const now = new Date();
            const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
            // 1. Find all transactions still pending admin confirmation for 3+ days
            const staleTransactions = yield prisma_1.default.transaction.findMany({
                where: {
                    status: client_1.transaction_status.waiting_for_admin_confirmation,
                    updated_at: { lt: threeDaysAgo },
                },
            });
            // Rollback all transactions
            for (const tx of staleTransactions) {
                yield prisma_1.default.$transaction((txClient) => __awaiter(this, void 0, void 0, function* () {
                    // a) Restore seats
                    yield txClient.event.update({
                        where: { id: tx.event_id },
                        data: { remaining_seats: { increment: tx.quantity } },
                    });
                    // b) Refund coupon usage
                    if (tx.coupon_id) {
                        yield txClient.coupon.update({
                            where: { id: tx.coupon_id },
                            data: { use_count: { decrement: 1 } },
                        });
                    }
                    // c) Refund voucher usage
                    if (tx.voucher_id) {
                        yield txClient.voucher.update({
                            where: { id: tx.voucher_id },
                            data: { usage_amount: { decrement: 1 } },
                        });
                    }
                    // d) Mark points unused
                    if (tx.points_id) {
                        yield txClient.points.update({
                            where: { id: tx.points_id },
                            data: { is_used: false },
                        });
                    }
                    // e) Finally cancel the transaction
                    yield txClient.transaction.update({
                        where: { id: tx.id },
                        data: { status: client_1.transaction_status.canceled, updated_at: new Date() },
                    });
                }));
            }
        }
        catch (err) {
            throw err;
        }
    });
}
