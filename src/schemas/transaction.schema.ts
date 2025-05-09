import { z } from "zod";

export const CreateTransactionSchema = z
  .object({
    userId: z.string().uuid("Invalid user ID format"),
    eventId: z.string().uuid("Invalid event ID format"),
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .positive("Quantity must be positive")
      .max(3, "Maximum 3 tickets per transaction"),
    voucherId: z.string().uuid().optional(),
    pointsId: z.string().uuid().optional(),
    couponId: z.string().uuid().optional(),
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
