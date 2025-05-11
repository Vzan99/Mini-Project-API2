import { Response, Request, NextFunction } from "express";
import { CheckCouponValidityService } from "../services/coupon.service";

async function CheckCouponValidityController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { user_id, coupon_code } = req.query;

    if (
      !user_id ||
      !coupon_code ||
      typeof user_id !== "string" ||
      typeof coupon_code !== "string"
    ) {
      throw new Error("User ID and coupon code are required");
    }

    const result = await CheckCouponValidityService(user_id, coupon_code);

    res.status(200).json({
      message: result.message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export { CheckCouponValidityController };
