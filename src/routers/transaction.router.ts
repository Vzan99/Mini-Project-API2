import { Router } from "express";
import {
  CreateTransactionController,
  PaymentTransactionController,
  EOActionTransactionController,
} from "../controllers/transaction.controller";
import { Multer } from "../utils/multer";
import ParamValidator from "../middlewares/paramValidator.middleware"; // Custom param validator
import ReqValidator from "../middlewares/reqValidator.middleware"; // Custom body validator
import {
  CreateTransactionSchema,
  EOActionSchema,
  PaymentParamSchema,
} from "../schemas/transaction.schema"; // Import schemas

const router = Router();

// Customer makes a transaction (body validated)
router.post(
  "/",
  ReqValidator(CreateTransactionSchema), // Validate body using schema
  CreateTransactionController
);

// EO Action (param and body validated)
router.post(
  "/:transactionId/action",
  ParamValidator(EOActionSchema.pick({ transactionId: true })), // Validate transactionId param
  ReqValidator(EOActionSchema.pick({ action: true })), // Validate action in body
  EOActionTransactionController
);

// Customer uploads payment proof (param validated, file upload after)
router.post(
  "/:id/payment",
  ParamValidator(PaymentParamSchema), // Validate id param
  Multer().single("payment_proof"), // Handle file upload
  PaymentTransactionController
);

export default router;
