import { z } from "zod";

export const CreateTransactionSchema = z.object({
  userId: z.string().uuid(),
  eventId: z.string(),
  quantity: z.number().int().positive(),
  voucherId: z.string().uuid().optional(),
  pointsId: z.string().uuid().optional(),
  couponId: z.string().uuid().optional(),
});

export const EOActionSchema = z.object({
  transactionId: z.string().uuid(),
  action: z.enum(["confirmed", "rejected"]),
});

export const PaymentParamSchema = z.object({
  id: z.string().uuid(), // From req.params
});
