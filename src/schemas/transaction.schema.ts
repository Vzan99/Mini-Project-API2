import { z } from "zod";

export const CreateTransactionSchema = z.object({
  userId: z.string().uuid(),
  eventId: z.string().uuid(),
  quantity: z.number().int().positive(),
  status: z.enum(["pending", "confirmed"]),
  unitPrice: z.number().nonnegative(),
  voucherId: z.string().uuid().optional(),
  pointsId: z.string().uuid().optional(),
  couponId: z.string().uuid().optional(),
  ticketCode: z.string().optional(),
});

export const EOActionSchema = z.object({
  transactionId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
});

export const PaymentParamSchema = z.object({
  id: z.string().uuid(), // From req.params
});
