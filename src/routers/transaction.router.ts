import { Router } from "express";
import { CreateTransactionController } from "../controllers/transaction.controller";

const router = Router();

// configure multer
// const upload = multer({
//     dest: "uploads/",        // adjust as needed
//     limits: { fileSize: 5e6 } // max 5MB
//   });

// // POST /transactions/:id/confirm
// router.post(
//     "/:id/confirm",
//     upload.single("paymentProof"), // expects form field named "paymentProof"
//     ConfirmTransactionController
//   );

router.post("/", CreateTransactionController);

export default router;
