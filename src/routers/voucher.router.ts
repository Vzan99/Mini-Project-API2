import { Router } from "express";
import { CreateVoucherController } from "../controllers/voucher.controller";
import ReqValidator from "../middlewares/reqValidator.middleware";
import { CreateVoucherSchema } from "../schemas/voucher.schema";

const router = Router();

router.post("/", ReqValidator(CreateVoucherSchema), CreateVoucherController);

export default router;
