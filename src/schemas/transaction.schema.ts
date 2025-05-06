import { z } from "zod";

export const CreateTransactionSchema = z.object({
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
