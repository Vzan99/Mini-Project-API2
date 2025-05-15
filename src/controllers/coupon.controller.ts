import { Response, Request, NextFunction } from "express";
import { CheckCouponValidityService } from "../services/coupon.service";

async function CheckCouponValidityController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { coupon_code } = req.query as { coupon_code: string };
    const user_id = req.user.id as string;

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
