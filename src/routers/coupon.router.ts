import { Router } from "express";
import { CheckCouponValidityController } from "../controllers/coupon.controller";
import QueryValidator from "../middlewares/queryValidator.middleware";
import { CheckCouponSchema } from "../schemas/coupon.schema";

const router = Router();

// Add the endpoint for checking coupon validity
router.get(
  "/check",
  QueryValidator(CheckCouponSchema),
  CheckCouponValidityController
);

export default router;