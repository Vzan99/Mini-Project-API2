"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionIdParamSchema = exports.QRISPaymentSchema = exports.PaymentParamSchema = exports.EOActionSchema = exports.CreateTransactionSchema = void 0;
const zod_1 = require("zod");
exports.CreateTransactionSchema = zod_1.z
    .object({
    event_id: zod_1.z.string().uuid("Invalid event ID format"),
    quantity: zod_1.z
        .number()
        .int("Quantity must be an integer")
        .positive("Quantity must be positive")
        .max(3, "Maximum 3 tickets per transaction"),
    attend_date: zod_1.z.coerce.date({
        required_error: "Attend date is required",
        invalid_type_error: "Attend date must be a valid date",
    }),
    payment_method: zod_1.z.string().min(1, "Payment method is required"), // Changed from enum to string
    voucher_id: zod_1.z.string().uuid("Invalid voucher ID format").optional(),
    coupon_id: zod_1.z.string().uuid("Invalid coupon ID format").optional(),
    points_used: zod_1.z.number().int().positive().optional(),
})
    .refine((data) => !(data.voucher_id && data.coupon_id), {
    message: "You can only use either a voucher or a coupon, not both",
    path: ["discounts"],
});
exports.EOActionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid transaction ID format"),
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
    user_id: zod_1.z.string().uuid("Invalid user ID format"),
    amount: zod_1.z.number().positive("Amount must be positive"),
});
exports.TransactionIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid transaction ID format"),
});
