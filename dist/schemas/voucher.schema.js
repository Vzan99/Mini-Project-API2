"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVoucherSchema = void 0;
const zod_1 = require("zod");
exports.CreateVoucherSchema = zod_1.z
    .object({
    eventId: zod_1.z.string().uuid({ message: "Invalid event ID" }),
    voucherCode: zod_1.z
        .string()
        .min(5, { message: "Voucher code must be at least 5 characters" })
        .max(50, { message: "Voucher code is too long" }),
    discountAmount: zod_1.z
        .number({ invalid_type_error: "Discount amount must be a number" })
        .positive({ message: "Discount amount must be greater than zero" }),
    maxUsage: zod_1.z
        .number({ invalid_type_error: "Max usage must be a number" })
        .int()
        .positive({ message: "Max usage must be greater than zero" }),
    voucherStartDate: zod_1.z.coerce
        .date()
        .refine((date) => date.getTime() >= Date.now() - 1000, {
        message: "Voucher start date cannot be in the past",
    }),
    voucherEndDate: zod_1.z.coerce.date(),
})
    .refine((data) => data.voucherEndDate > data.voucherStartDate, {
    message: "Voucher end date must be after start date",
    path: ["voucherEndDate"],
});
