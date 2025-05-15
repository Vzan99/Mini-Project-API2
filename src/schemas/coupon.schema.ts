import { z } from "zod";

export const CheckCouponSchema = z.object({
  coupon_code: z.string().min(1, { message: "Coupon code is required" }),
});
