"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransactionController = CreateTransactionController;
exports.PaymentTransactionController = PaymentTransactionController;
exports.EOActionTransactionController = EOActionTransactionController;
exports.GetUserTicketsController = GetUserTicketsController;
exports.GetTransactionByIdController = GetTransactionByIdController;
const transaction_service_1 = require("../services/transaction.service");
function CreateTransactionController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Extract userId from JWT token (set by TokenVerification middleware)
            const user_id = req.user.id;
            // Add userId to the request body before passing to service
            const transactionData = Object.assign(Object.assign({}, req.body), { user_id });
            const data = yield (0, transaction_service_1.CreateTransactionService)(transactionData);
            res.status(201).send({
                message: "Create Transaction Success!",
                data,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
//Upload Image dan ConfirmTransaction Service
//Kalau eventnya free apa boleh langsung confirm tanpa approve admin??
function PaymentTransactionController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const { id } = req.params;
            // const userId = req.user?.id; // Assuming you're attaching the authenticated user to req.user
            // const { userId } = req.body; // Ngambil dari body dulu, karena belum ada authentication
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!req.file) {
                return next(new Error("Payment proof image is required"));
            }
            if (!user_id) {
                return next(new Error("Unauthorized: User ID missing"));
            }
            const updatedTransaction = yield (0, transaction_service_1.PaymentTransactionService)({
                id: String(id),
                user_id,
                file: req.file,
            });
            // Send the updated transaction data to the next handler (or to the response)
            res.status(200).json({
                message: "Payment proof submitted successfully",
                data: updatedTransaction,
            });
        }
        catch (err) {
            // Forward error to the next handler (for centralized error handling)
            next(err);
        }
    });
}
//EO Action Controller (Confirmed or Rejected)
function EOActionTransactionController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { action } = req.body;
            // Get the user ID from the authenticated user
            const user_id = req.user.id;
            // Call the service with the correct parameter name
            const updatedTransaction = yield (0, transaction_service_1.EOActionTransactionService)({
                id: String(id),
                user_id, // This should match the parameter name in your service
                action,
            });
            // Send response with the updated transaction data
            res.status(200).json({
                message: "Transaction status updated successfully",
                data: updatedTransaction,
            });
        }
        catch (err) {
            // Forward error to the next handler (for centralized error handling)
            next(err);
        }
    });
}
function GetUserTicketsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get the user ID from the authenticated user
            const user_id = req.user.id;
            // Call the service to get the user's tickets
            const tickets = yield (0, transaction_service_1.GetUserTicketsService)(user_id);
            // Send response with the tickets data
            res.status(200).json({
                message: "User tickets retrieved successfully",
                data: tickets,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function GetTransactionByIdController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const transaction = yield (0, transaction_service_1.GetTransactionByIdService)(id, userId);
            res.status(200).json({
                message: "Transaction retrieved successfully",
                data: transaction,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
