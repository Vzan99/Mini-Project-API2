import { z } from "zod";

export const CreateVoucherSchema = z
  .object({
    eventId: z.string().uuid({ message: "Invalid event ID" }),

    voucherCode: z
      .string()
      .min(5, { message: "Voucher code must be at least 5 characters" })
      .max(50, { message: "Voucher code is too long" }),

    discountAmount: z
      .number({ invalid_type_error: "Discount amount must be a number" })
      .positive({ message: "Discount amount must be greater than zero" }),

    maxUsage: z
      .number({ invalid_type_error: "Max usage must be a number" })
      .int()
      .positive({ message: "Max usage must be greater than zero" }),

    voucherStartDate: z.coerce
      .date()
      .refine((date) => date.getTime() >= Date.now() - 1000, {
        message: "Voucher start date cannot be in the past",
      }),

    voucherEndDate: z.coerce.date(),
  })
  .refine((data) => data.voucherEndDate > data.voucherStartDate, {
    message: "Voucher end date must be after start date",
    path: ["voucherEndDate"],
  });
