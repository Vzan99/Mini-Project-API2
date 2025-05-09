import prisma from "../lib/prisma";

async function CheckCouponValidityService(userId: string, couponCode: string) {
  try {
    // Find the coupon by code and user ID
    const coupon = await prisma.coupon.findFirst({
      where: {
        user_id: userId,
        coupon_code: couponCode,
      },
    });

    // If coupon doesn't exist
    if (!coupon) {
      return {
        isValid: false,
        message: "Coupon not found",
      };
    }

    const now = new Date();

    // Check if coupon is within valid date range
    if (now < coupon.coupon_start_date) {
      return {
        isValid: false,
        message: "Coupon is not yet active",
        activeFrom: coupon.coupon_start_date,
      };
    }

    if (now > coupon.coupon_end_date) {
      return {
        isValid: false,
        message: "Coupon has expired",
        expiredAt: coupon.coupon_end_date,
      };
    }

    // Check if coupon has reached max usage
    if (coupon.use_count >= coupon.max_usage) {
      return {
        isValid: false,
        message: "Coupon has reached maximum usage limit",
      };
    }

    // Coupon is valid
    return {
      isValid: true,
      message: "Coupon is valid",
      couponId: coupon.id,
      discountAmount: coupon.discount_amount,
      remainingUses: coupon.max_usage - coupon.use_count,
    };
  } catch (err) {
    throw err;
  }
}

export { CheckCouponValidityService };