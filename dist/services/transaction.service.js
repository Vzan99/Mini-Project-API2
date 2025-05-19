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
exports.GetUserTicketsService = GetUserTicketsService;
exports.GetTransactionByIdService = GetTransactionByIdService;
exports.GenerateFreeTicketService = GenerateFreeTicketService;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const cloudinary_1 = require("../utils/cloudinary");
const crypto_1 = require("crypto");
const nodemailer_1 = require("../utils/nodemailer");
function CreateTransactionService(param) {
    return __awaiter(this, void 0, void 0, function* () {
        const { user_id, event_id, quantity, attend_date, payment_method, coupon_id, voucher_id, points_used, } = param;
        if (coupon_id && voucher_id) {
            throw new Error("You can only use either a voucher or a coupon, not both");
        }
        const [event, user] = yield Promise.all([
            prisma_1.default.event.findUnique({ where: { id: event_id } }),
            prisma_1.default.user.findUnique({ where: { id: user_id } }),
        ]);
        if (!event)
            throw new Error("Event not found");
        if (!user)
            throw new Error("User not found");
        if (event.remaining_seats < quantity) {
            throw new Error("Not enough seats available");
        }
        const eventStartDate = new Date(event.start_date);
        const eventEndDate = new Date(event.end_date);
        if (attend_date < eventStartDate || attend_date > eventEndDate) {
            throw new Error("Attend date must be within event start and end dates");
        }
        const now = new Date();
        let couponDiscount = 0;
        let voucherDiscount = 0;
        let pointsDiscount = 0;
        let pointsToUse = [];
        if (coupon_id) {
            const coupon = yield prisma_1.default.coupon.findUnique({ where: { id: coupon_id } });
            if (!coupon ||
                coupon.user_id !== user_id ||
                now < coupon.coupon_start_date ||
                now > coupon.coupon_end_date ||
                coupon.use_count >= coupon.max_usage) {
                throw new Error("Invalid or expired coupon");
            }
            couponDiscount = coupon.discount_amount;
        }
        if (voucher_id) {
            const voucher = yield prisma_1.default.voucher.findUnique({
                where: { id: voucher_id },
            });
            if (!voucher ||
                voucher.event_id !== event_id ||
                now < voucher.voucher_start_date ||
                now > voucher.voucher_end_date ||
                voucher.usage_amount >= voucher.max_usage) {
                throw new Error("Invalid or expired voucher");
            }
            voucherDiscount = voucher.discount_amount;
        }
        if (points_used && points_used > 0) {
            const availablePoints = yield prisma_1.default.points.findMany({
                where: {
                    user_id,
                    is_used: false,
                    is_expired: false,
                    expires_at: { gt: now },
                },
                orderBy: { expires_at: "asc" },
            });
            let totalAvailable = 0;
            for (const p of availablePoints) {
                if (totalAvailable >= points_used)
                    break;
                totalAvailable += p.points_amount;
                pointsToUse.push(p.id);
            }
            if (totalAvailable < points_used) {
                throw new Error("Not enough available points");
            }
            pointsDiscount = points_used;
        }
        const originalAmount = event.price * quantity;
        const totalDiscount = couponDiscount + voucherDiscount + pointsDiscount;
        const finalAmount = Math.max(0, originalAmount - totalDiscount);
        let status;
        let expiresAt;
        if (finalAmount === 0) {
            status = client_1.transaction_status.confirmed;
            expiresAt = now;
        }
        else {
            status = client_1.transaction_status.waiting_for_payment;
            expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        }
        const tx = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
            const transaction = yield tx.transaction.create({
                data: {
                    user_id,
                    event_id,
                    quantity,
                    unit_price: event.price,
                    total_pay_amount: finalAmount,
                    payment_proof: null,
                    status,
                    expires_at: expiresAt,
                    coupon_id: coupon_id !== null && coupon_id !== void 0 ? coupon_id : undefined,
                    voucher_id: voucher_id !== null && voucher_id !== void 0 ? voucher_id : undefined,
                    attend_date,
                    payment_method,
                },
            });
            yield tx.event.update({
                where: { id: event_id },
                data: { remaining_seats: event.remaining_seats - quantity },
            });
            if (coupon_id) {
                yield tx.coupon.update({
                    where: { id: coupon_id },
                    data: { use_count: { increment: 1 } },
                });
            }
            if (voucher_id) {
                yield tx.voucher.update({
                    where: { id: voucher_id },
                    data: { usage_amount: { increment: 1 } },
                });
            }
            if (pointsToUse.length > 0) {
                yield tx.points.updateMany({
                    where: { id: { in: pointsToUse } },
                    data: { is_used: true },
                });
            }
            return transaction;
        }));
        return tx;
    });
}
function PaymentTransactionService(_a) {
    return __awaiter(this, arguments, void 0, function* ({ id, user_id, file, }) {
        let url = "";
        try {
            const tx = yield prisma_1.default.transaction.findUnique({
                where: { id: id },
            });
            if (!tx) {
                throw new Error("Transaction not found");
            }
            if (tx.user_id !== user_id) {
                throw new Error("You are not authorized to confirm this transaction");
            }
            if (tx.status !== client_1.transaction_status.waiting_for_payment) {
                throw new Error("Transaction is not awaiting payment");
            }
            if (tx.expires_at && tx.expires_at < new Date()) {
                yield prisma_1.default.transaction.update({
                    where: { id: id },
                    data: { status: client_1.transaction_status.expired },
                });
                throw new Error("Transaction has expired");
            }
            const { secure_url } = yield (0, cloudinary_1.cloudinaryUpload)(file);
            url = secure_url;
            const splitUrl = secure_url.split("/");
            const fileName = splitUrl[splitUrl.length - 1];
            const updatedTx = yield prisma_1.default.$transaction((txClient) => __awaiter(this, void 0, void 0, function* () {
                const updatedTransaction = yield txClient.transaction.update({
                    where: { id: id },
                    data: {
                        payment_proof: fileName,
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
function EOActionTransactionService(param) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id, user_id, action } = param;
            // Fetch the transaction along with its event to ensure the EO is authorized to act
            const transaction = yield prisma_1.default.transaction.findUnique({
                where: { id: id },
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
            if (event.organizer_id !== user_id) {
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
                        where: { id: id },
                        data: {
                            status: updatedStatus,
                            updated_at: new Date(),
                        },
                    });
                    // Send rejection email using template literals instead of Handlebars
                    const htmlContent = `
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Transaction Rejected</title>
          </head>
          <body>
            <div
              style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"
            >
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #e53e3e;">Transaction Rejected</h2>
              </div>

              <div
                style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin-bottom: 20px;"
              >
                <p>Hi ${transaction.user.username},</p>
                <p>We regret to inform you that your transaction for
                  <strong>${transaction.event.name}</strong>
                  has been rejected by the event organizer.</p>

                <div
                  style="background-color: #fff; border-left: 4px solid #e53e3e; padding: 15px; margin: 15px 0;"
                >
                  <p style="margin: 0;"><strong>Transaction ID:</strong>
                    ${transaction.id}</p>
                  <p style="margin: 8px 0 0;"><strong>Rejection Reason:</strong>
                    Your transaction has been rejected</p>
                </div>

                <p>Any points, vouchers, or coupons used for this transaction have been
                  returned to your account. The seats you reserved have also been made
                  available again.</p>
              </div>

              <div style="margin: 24px 0; text-align: center;">
                <a
                  href="https://yourdomain.com/my-transactions"
                  style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;"
                >
                  View My Transactions
                </a>
              </div>

              <div
                style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666;"
              >
                <p>If you have any questions about this rejection, please contact the
                  event organizer directly or reply to this email for assistance.</p>
                <p>Thank you for using our platform.</p>
                <p>Best regards,<br /><strong>Ticket Team</strong></p>
              </div>
            </div>
          </body>
        </html>`;
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
                // For confirmation, update status and generate tickets
                return yield prisma_1.default.$transaction((txClient) => __awaiter(this, void 0, void 0, function* () {
                    // Update the transaction status
                    const updatedTransaction = yield txClient.transaction.update({
                        where: { id: id },
                        data: {
                            status: updatedStatus,
                            updated_at: new Date(),
                        },
                    });
                    // Generate tickets for the confirmed transaction
                    const tickets = [];
                    for (let i = 0; i < transaction.quantity; i++) {
                        // Generate random ticket code
                        const ticketCode = (0, crypto_1.randomBytes)(8).toString("hex").toUpperCase();
                        const ticket = yield txClient.ticket.create({
                            data: {
                                ticket_code: ticketCode,
                                event_id: transaction.event_id,
                                user_id: transaction.user_id,
                                transaction_id: id,
                            },
                        });
                        tickets.push(ticket);
                    }
                    // Send confirmation email using template literals instead of Handlebars
                    const htmlContent = `
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Transaction Confirmed</title>
            </head>
            <body>
              <div
                style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"
              >
                <div style="text-align: center; margin-bottom: 20px;">
                  <h2 style="color: #10b981;">Transaction Confirmed</h2>
                </div>

                <div
                  style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin-bottom: 20px;"
                >
                  <p>Hi ${transaction.user.username},</p>
                  <p>Great news! Your transaction for
                    <strong>${transaction.event.name}</strong>
                    has been confirmed by the event organizer.</p>

                  <div
                    style="background-color: #fff; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0;"
                  >
                    <p style="margin: 0;"><strong>Transaction ID:</strong>
                      ${transaction.id}</p>
                    <p style="margin: 8px 0 0;"><strong>Event Date:</strong>
                      ${new Date(transaction.event.start_date).toLocaleDateString()}</p>
                    <p style="margin: 8px 0 0;"><strong>Quantity:</strong>
                      ${transaction.quantity} ticket(s)</p>
                  </div>

                  <p>You're all set! Your tickets are now confirmed and ready for the event.</p>
                </div>

                <div style="margin: 24px 0; text-align: center;">
                  <a
                    href="https://yourdomain.com/my-tickets"
                    style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;"
                  >
                    View My Tickets
                  </a>
                </div>

                <div
                  style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666;"
                >
                  <p>We look forward to seeing you at the event!</p>
                  <p>If you have any questions, please contact the event organizer or reply to this email.</p>
                  <p>Best regards,<br /><strong>Ticket Team</strong></p>
                </div>
              </div>
            </body>
          </html>`;
                    yield nodemailer_1.transporter.sendMail({
                        from: '"Ticket Admin" <no-reply@yourdomain.com>',
                        to: transaction.user.email,
                        subject: "Transaction Confirmed",
                        html: htmlContent,
                    });
                    return Object.assign(Object.assign({}, updatedTransaction), { tickets });
                }), {
                    timeout: 10000, // Increase timeout to 10 seconds
                    maxWait: 5000, // Maximum time to wait for transaction to start
                    isolationLevel: client_1.Prisma.TransactionIsolationLevel.ReadCommitted, // Less strict isolation level
                });
            }
        }
        catch (err) {
            throw err;
        }
    });
}
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
            const staleTransactions = yield prisma_1.default.transaction.findMany({
                where: {
                    status: client_1.transaction_status.waiting_for_admin_confirmation,
                    updated_at: { lt: threeDaysAgo },
                },
            });
            for (const tx of staleTransactions) {
                yield prisma_1.default.$transaction((txClient) => __awaiter(this, void 0, void 0, function* () {
                    yield txClient.event.update({
                        where: { id: tx.event_id },
                        data: { remaining_seats: { increment: tx.quantity } },
                    });
                    if (tx.coupon_id) {
                        yield txClient.coupon.update({
                            where: { id: tx.coupon_id },
                            data: { use_count: { decrement: 1 } },
                        });
                    }
                    if (tx.voucher_id) {
                        yield txClient.voucher.update({
                            where: { id: tx.voucher_id },
                            data: { usage_amount: { decrement: 1 } },
                        });
                    }
                    if (tx.points_id) {
                        yield txClient.points.update({
                            where: { id: tx.points_id },
                            data: { is_used: false },
                        });
                    }
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
function GetUserTicketsService(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tickets = yield prisma_1.default.ticket.findMany({
                where: {
                    user_id: userId,
                    transaction: {
                        status: client_1.transaction_status.confirmed,
                    },
                },
                include: {
                    event: {
                        select: {
                            name: true,
                            start_date: true,
                            end_date: true,
                            location: true,
                            event_image: true,
                        },
                    },
                    transaction: {
                        select: {
                            created_at: true,
                            quantity: true,
                            total_pay_amount: true,
                        },
                    },
                },
                orderBy: {
                    event: {
                        start_date: "asc",
                    },
                },
            });
            return tickets;
        }
        catch (err) {
            throw err;
        }
    });
}
function GetTransactionByIdService(transactionId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transaction = yield prisma_1.default.transaction.findUnique({
                where: { id: transactionId },
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            location: true,
                            start_date: true,
                            end_date: true,
                            event_image: true,
                            organizer_id: true,
                            organizer: {
                                select: {
                                    username: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                    tickets: true,
                    voucher: {
                        select: {
                            voucher_code: true,
                            discount_amount: true,
                        },
                    },
                    coupon: {
                        select: {
                            coupon_code: true,
                            discount_amount: true,
                        },
                    },
                    points: {
                        select: {
                            id: true,
                            points_amount: true,
                        },
                    },
                },
            });
            if (!transaction) {
                throw new Error("Transaction not found");
            }
            if (transaction.user_id !== userId &&
                transaction.event.organizer_id !== userId) {
                throw new Error("You are not authorized to view this transaction");
            }
            const discounts = [];
            if (transaction.voucher) {
                discounts.push({
                    type: "voucher",
                    code: transaction.voucher.voucher_code,
                    amount: transaction.voucher.discount_amount,
                });
            }
            if (transaction.coupon) {
                discounts.push({
                    type: "coupon",
                    code: transaction.coupon.coupon_code,
                    amount: transaction.coupon.discount_amount,
                });
            }
            if (transaction.points) {
                discounts.push({
                    type: "points",
                    amount: transaction.points.points_amount,
                });
            }
            return Object.assign(Object.assign({}, transaction), { discounts });
        }
        catch (err) {
            throw err;
        }
    });
}
function GenerateFreeTicketService(id, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = yield prisma_1.default.transaction.findUnique({
            where: { id },
            include: { tickets: true },
        });
        if (!tx)
            throw new Error("Transaction not found");
        if (tx.user_id !== user_id)
            throw new Error("Forbidden: Not your transaction");
        if (tx.total_pay_amount !== 0)
            throw new Error("This service is only for free transactions");
        if (tx.status !== client_1.transaction_status.confirmed)
            throw new Error("Transaction must be confirmed to generate tickets");
        if (tx.tickets.length > 0) {
            return {
                message: "Tickets already created for this free transaction",
                tickets: tx.tickets,
            };
        }
        const createdTickets = [];
        yield prisma_1.default.$transaction((txClient) => __awaiter(this, void 0, void 0, function* () {
            console.log("Quantity:", tx.quantity);
            for (let i = 0; i < tx.quantity; i++) {
                const ticketCode = (0, crypto_1.randomBytes)(8).toString("hex").toUpperCase();
                const ticket = yield txClient.ticket.create({
                    data: {
                        ticket_code: ticketCode,
                        event_id: tx.event_id,
                        user_id: tx.user_id,
                        transaction_id: tx.id,
                    },
                });
                createdTickets.push(ticket);
            }
        }));
        return {
            message: "Tickets created for free transaction",
            tickets: createdTickets,
        };
    });
}
