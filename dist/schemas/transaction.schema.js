"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRISPaymentSchema = exports.PaymentParamSchema = exports.EOActionSchema = exports.CreateTransactionSchema = void 0;
const zod_1 = require("zod");
exports.CreateTransactionSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid("Invalid user ID format"),
    eventId: zod_1.z.string().uuid("Invalid event ID format"),
    quantity: zod_1.z
        .number()
        .int("Quantity must be an integer")
        .positive("Quantity must be positive")
        .max(3, "Maximum 3 tickets per transaction"),
    voucherId: zod_1.z.string().uuid().optional(),
    pointsId: zod_1.z.string().uuid().optional(),
    couponId: zod_1.z.string().uuid().optional(),
});
exports.EOActionSchema = zod_1.z.object({
    transactionId: zod_1.z.string().uuid("Invalid transaction ID format"),
    action: zod_1.z.enum(["confirmed", "rejected"], {
        errorMap: () => ({
            message: "Action must be either 'confirmed' or 'rejected'",
        }),
    }),
});
exports.PaymentParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(), // From req.params
});
exports.QRISPaymentSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid("Invalid user ID format"),
    amount: zod_1.z.number().positive("Amount must be positive"),
});
