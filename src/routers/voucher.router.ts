import { Router } from "express";
import { CreateVoucherController } from "../controllers/voucher.controller";
import ReqValidator from "../middlewares/reqValidator.middleware";
import { CreateVoucherSchema } from "../schemas/voucher.schema";
import { TokenVerification } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/",
  TokenVerification,
  ReqValidator(CreateVoucherSchema),
  CreateVoucherController
);

export default router;
