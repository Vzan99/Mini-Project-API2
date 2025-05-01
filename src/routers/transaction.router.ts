import { Router } from "express";
import {
  CreateTransactionController,
  PaymentTransactionController,
  EOActionTransactionController,
} from "../controllers/transaction.controller";
import { Multer } from "../utils/multer";
const router = Router();

//Customer Payment (Upload Payment Proof)
router.post(
  "/:id/payment",
  Multer().single("payment_proof"), // memory upload
  PaymentTransactionController
);

//EO Action
router.post("/:transactionId/action", EOActionTransactionController);

//Customer make a transaction
router.post("/", CreateTransactionController);

export default router;
