import { Response, Request, NextFunction } from "express";
import { CheckCouponValidityService } from "../services/coupon.service";

async function CheckCouponValidityController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId, couponCode } = req.query;

    if (
      !userId ||
      !couponCode ||
      typeof userId !== "string" ||
      typeof couponCode !== "string"
    ) {
      throw new Error("User ID and coupon code are required");
    }

    const result = await CheckCouponValidityService(userId, couponCode);

    res.status(200).json({
      message: result.message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export { CheckCouponValidityController };