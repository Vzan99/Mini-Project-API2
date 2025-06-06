"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const multer_1 = require("../utils/multer");
const paramValidator_middleware_1 = __importDefault(require("../middlewares/paramValidator.middleware")); // Custom param validator
const reqValidator_middleware_1 = __importDefault(require("../middlewares/reqValidator.middleware")); // Custom body validator
const transaction_schema_1 = require("../schemas/transaction.schema"); // Import schemas
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Create a transaction
router.post("/", auth_middleware_1.TokenVerification, (0, reqValidator_middleware_1.default)(transaction_schema_1.CreateTransactionSchema), transaction_controller_1.CreateTransactionController);
// Get user's tickets
router.get("/tickets", auth_middleware_1.TokenVerification, transaction_controller_1.GetUserTicketsController);
// Get transaction by ID
router.get("/:id", auth_middleware_1.TokenVerification, (0, paramValidator_middleware_1.default)(transaction_schema_1.TransactionIdParamSchema), transaction_controller_1.GetTransactionByIdController);
// EO Action
router.post("/:id/action", auth_middleware_1.TokenVerification, (0, paramValidator_middleware_1.default)(transaction_schema_1.EOActionSchema.pick({ id: true })), (0, reqValidator_middleware_1.default)(transaction_schema_1.EOActionSchema.pick({ action: true })), transaction_controller_1.EOActionTransactionController);
// Customer uploads payment proof
router.post("/:id/payment", auth_middleware_1.TokenVerification, (0, paramValidator_middleware_1.default)(transaction_schema_1.PaymentParamSchema), (0, multer_1.Multer)().single("payment_proof"), transaction_controller_1.PaymentTransactionController);
// Generate free tickets
router.post("/:id/generate-free-tickets", auth_middleware_1.TokenVerification, (0, paramValidator_middleware_1.default)(transaction_schema_1.TransactionIdParamSchema), transaction_controller_1.GenerateFreeTicketController);
exports.default = router;
