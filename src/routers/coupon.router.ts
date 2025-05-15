import { Router } from "express";
import { CheckCouponValidityController } from "../controllers/coupon.controller";
import QueryValidator from "../middlewares/queryValidator.middleware";
import { CheckCouponSchema } from "../schemas/coupon.schema";
import { TokenVerification } from "../middlewares/auth.middleware";

const router = Router();

// Add the endpoint for checking coupon validity
router.get(
  "/check",
  TokenVerification,
  QueryValidator(CheckCouponSchema),
  CheckCouponValidityController
);

export default router;
