import { z } from "zod";

export const CheckCouponSchema = z.object({
  user_id: z.string().uuid({ message: "Invalid user ID" }),
  coupon_code: z.string().min(1, { message: "Coupon code is required" }),
});
