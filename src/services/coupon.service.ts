import prisma from "../lib/prisma";

async function CheckCouponValidityService(
  user_id: string,
  coupon_code: string
) {
  try {
    // Find the coupon by code and user ID
    const coupon = await prisma.coupon.findFirst({
      where: {
        user_id: user_id,
        coupon_code: coupon_code,
      },
    });

    // If coupon doesn't exist
    if (!coupon) {
      return {
        is_valid: false,
        message: "Coupon not found",
      };
    }

    const now = new Date();

    // Check if coupon is within valid date range
    if (now < coupon.coupon_start_date) {
      return {
        is_valid: false,
        message: "Coupon is not yet active",
        active_from: coupon.coupon_start_date,
      };
    }

    if (now > coupon.coupon_end_date) {
      return {
        is_valid: false,
        message: "Coupon has expired",
        expired_at: coupon.coupon_end_date,
      };
    }

    // Check if coupon has reached max usage
    if (coupon.use_count >= coupon.max_usage) {
      return {
        is_valid: false,
        message: "Coupon has reached maximum usage limit",
      };
    }

    // Coupon is valid
    return {
      is_valid: true,
      message: "Coupon is valid",
      coupon_id: coupon.id,
      discount_amount: coupon.discount_amount,
      remaining_uses: coupon.max_usage - coupon.use_count,
    };
  } catch (err) {
    throw err;
  }
}

export { CheckCouponValidityService };
