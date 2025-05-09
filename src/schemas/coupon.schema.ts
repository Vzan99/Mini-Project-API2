import { z } from "zod";

export const CheckCouponSchema = z.object({
  userId: z.string().uuid({ message: "Invalid user ID" }),
  couponCode: z.string().min(1, { message: "Coupon code is required" }),
});