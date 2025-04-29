import { Router } from "express";
import { CreateVoucherController } from "../controllers/voucher.controller";

const router = Router();

router.post("/", CreateVoucherController);

export default router;
