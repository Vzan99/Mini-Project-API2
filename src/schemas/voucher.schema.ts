import { z } from "zod";

export const CreateVoucherSchema = z
  .object({
    event_id: z.string().uuid({ message: "Invalid event ID" }),

    voucher_code: z
      .string()
      .min(5, { message: "Voucher code must be at least 5 characters" })
      .max(50, { message: "Voucher code is too long" }),

    discount_amount: z
      .number({ invalid_type_error: "Discount amount must be a number" })
      .positive({ message: "Discount amount must be greater than zero" }),

    max_usage: z
      .number({ invalid_type_error: "Max usage must be a number" })
      .int()
      .positive({ message: "Max usage must be greater than zero" }),

    voucher_start_date: z.coerce
      .date()
      .refine((date) => date.getTime() >= Date.now() - 1000, {
        message: "Voucher start date cannot be in the past",
      }),

    voucher_end_date: z.coerce.date(),
  })
  .refine((data) => data.voucher_end_date > data.voucher_start_date, {
    message: "Voucher end date must be after start date",
    path: ["voucherEndDate"],
  });

export const CheckVoucherSchema = z.object({
  event_id: z.string().uuid({ message: "Invalid event ID" }),
  voucher_code: z.string().min(1, { message: "Voucher code is required" }),
});
