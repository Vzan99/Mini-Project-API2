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
// Customer makes a transaction (body validated)
router.post("/", auth_middleware_1.TokenVerification, (0, reqValidator_middleware_1.default)(transaction_schema_1.CreateTransactionSchema), // Validate body using schema
transaction_controller_1.CreateTransactionController);
// EO Action (param and body validated)
router.post("/:transactionId/action", auth_middleware_1.TokenVerification, (0, paramValidator_middleware_1.default)(transaction_schema_1.EOActionSchema.pick({ transactionId: true })), // Validate transactionId param
(0, reqValidator_middleware_1.default)(transaction_schema_1.EOActionSchema.pick({ action: true })), // Validate action in body
transaction_controller_1.EOActionTransactionController);
// Customer uploads payment proof (param validated, file upload after)
router.post("/:id/payment", auth_middleware_1.TokenVerification, (0, paramValidator_middleware_1.default)(transaction_schema_1.PaymentParamSchema), // Validate id param
(0, multer_1.Multer)().single("payment_proof"), // Handle file upload
transaction_controller_1.PaymentTransactionController);
exports.default = router;
