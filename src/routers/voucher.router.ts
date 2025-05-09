import { Router } from "express";
import {
  CreateVoucherController,
  CheckVoucherValidityController,
} from "../controllers/voucher.controller";
import ReqValidator from "../middlewares/reqValidator.middleware";
import QueryValidator from "../middlewares/queryValidator.middleware";
import {
  CreateVoucherSchema,
  CheckVoucherSchema,
} from "../schemas/voucher.schema";
import { TokenVerification } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/",
  TokenVerification,
  ReqValidator(CreateVoucherSchema),
  CreateVoucherController
);

// Add the new endpoint for checking voucher validity
router.get(
  "/check",
  QueryValidator(CheckVoucherSchema),
  CheckVoucherValidityController
);

export default router;
