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

// Create a voucher
router.post(
  "/",
  TokenVerification,
  ReqValidator(CreateVoucherSchema),
  CreateVoucherController
);

// Check Validity Voucher
router.get(
  "/check",
  QueryValidator(CheckVoucherSchema),
  CheckVoucherValidityController
);

export default router;
