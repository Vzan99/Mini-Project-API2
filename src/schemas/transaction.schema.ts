import { z } from "zod";

export const CreateTransactionSchema = z
  .object({
    eventId: z.string().uuid("Invalid event ID format"),
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .positive("Quantity must be positive")
      .max(3, "Maximum 3 tickets per transaction"),
    attendDate: z.coerce.date({
      required_error: "Attend date is required",
      invalid_type_error: "Attend date must be a valid date",
    }),
    paymentMethod: z.string().min(1, "Payment method is required"), // Changed from enum to string
    voucherId: z.string().uuid("Invalid voucher ID format").optional(),
    couponId: z.string().uuid("Invalid coupon ID format").optional(),
    pointsId: z.string().uuid("Invalid points ID format").optional(),
  })
  .refine((data) => !(data.voucherId && data.couponId), {
    message: "You can only use either a voucher or a coupon, not both",
    path: ["discounts"],
  });

export const EOActionSchema = z.object({
  transactionId: z.string().uuid("Invalid transaction ID format"),
  action: z.enum(["confirmed", "rejected"], {
    errorMap: () => ({
      message: "Action must be either 'confirmed' or 'rejected'",
    }),
  }),
});

export const PaymentParamSchema = z.object({
  id: z.string().uuid(), // From req.params
});

export const QRISPaymentSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  amount: z.number().positive("Amount must be positive"),
});

export const TransactionIdParamSchema = z.object({
  transactionId: z.string().uuid("Invalid transaction ID format"),
});
