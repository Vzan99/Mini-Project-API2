import { Router } from "express";
import {
  CreateTransactionController,
  PaymentTransactionController,
  EOActionTransactionController,
  GetUserTicketsController,
  GetTransactionByIdController,
  GenerateFreeTicketController,
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
import { GenerateFreeTicketService } from "../services/transaction.service";

const router = Router();

// Create a transaction
router.post(
  "/",
  TokenVerification,
  ReqValidator(CreateTransactionSchema),
  CreateTransactionController
);

// Get user's tickets
router.get("/tickets", TokenVerification, GetUserTicketsController);

// Get transaction by ID
router.get(
  "/:id",
  TokenVerification,
  ParamValidator(TransactionIdParamSchema),
  GetTransactionByIdController
);

// EO Action
router.post(
  "/:id/action",
  TokenVerification,
  ParamValidator(EOActionSchema.pick({ id: true })),
  ReqValidator(EOActionSchema.pick({ action: true })),
  EOActionTransactionController
);

// Customer uploads payment proof
router.post(
  "/:id/payment",
  TokenVerification,
  ParamValidator(PaymentParamSchema),
  Multer().single("payment_proof"),
  PaymentTransactionController
);

// Generate free tickets
router.post(
  "/:id/generate-free-tickets",
  TokenVerification,
  ParamValidator(TransactionIdParamSchema),
  GenerateFreeTicketController
);

export default router;
