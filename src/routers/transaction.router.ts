import { Router } from "express";
import {
  CreateTransactionController,
  PaymentTransactionController,
  EOActionTransactionController,
  GetUserTicketsController,
  GetTransactionByIdController,
} from "../controllers/transaction.controller";
import { Multer } from "../utils/multer";
import ParamValidator from "../middlewares/paramValidator.middleware"; // Custom param validator
import ReqValidator from "../middlewares/reqValidator.middleware"; // Custom body validator
import {
  CreateTransactionSchema,
  EOActionSchema,
  PaymentParamSchema,
  TransactionIdParamSchema,
} from "../schemas/transaction.schema"; // Import schemas
import { TokenVerification } from "../middlewares/auth.middleware";

const router = Router();

// Customer makes a transaction (body validated)
router.post(
  "/",
  TokenVerification,
  ReqValidator(CreateTransactionSchema), // Validate body using schema
  CreateTransactionController
);

// Get user's tickets (must come before /:transactionId route)
router.get("/tickets", TokenVerification, GetUserTicketsController);

// Get transaction by ID
router.get(
  "/:id",
  TokenVerification,
  ParamValidator(TransactionIdParamSchema),
  GetTransactionByIdController
);

// EO Action (param and body validated)
router.post(
  "/:id/action",
  TokenVerification,
  ParamValidator(EOActionSchema.pick({ id: true })), // Validate transactionId param
  ReqValidator(EOActionSchema.pick({ action: true })), // Validate action in body
  EOActionTransactionController
);

// Customer uploads payment proof (param validated, file upload after)
router.post(
  "/:id/payment",
  TokenVerification,
  ParamValidator(PaymentParamSchema), // Validate id param
  Multer().single("payment_proof"), // Handle file upload
  PaymentTransactionController
);

export default router;
