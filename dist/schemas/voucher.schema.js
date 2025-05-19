"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckVoucherSchema = exports.CreateVoucherSchema = void 0;
const zod_1 = require("zod");
exports.CreateVoucherSchema = zod_1.z.object({
    event_id: zod_1.z.string().uuid({ message: "Invalid event ID" }),
    voucher_code: zod_1.z
        .string()
        .min(5, { message: "Voucher code must be at least 5 characters" })
        .max(25, { message: "Voucher code is too long" }),
    discount_amount: zod_1.z.coerce
        .number({ invalid_type_error: "Discount amount must be a number" })
        .positive({ message: "Discount amount must be greater than zero" }),
    max_usage: zod_1.z.coerce
        .number({ invalid_type_error: "Max usage must be a number" })
        .int()
        .positive({ message: "Max usage must be greater than zero" }),
    voucher_start_date: zod_1.z.coerce.date(),
    voucher_end_date: zod_1.z.coerce.date(),
});
exports.CheckVoucherSchema = zod_1.z.object({
    event_id: zod_1.z.string().uuid({ message: "Invalid event ID" }),
    voucher_code: zod_1.z.string().min(1, { message: "Voucher code is required" }),
});
