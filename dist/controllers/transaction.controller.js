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
const transaction_service_1 = require("../services/transaction.service");
function CreateTransactionController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, transaction_service_1.CreateTransactionService)(req.body);
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
        try {
            const { id: transactionId } = req.params;
            // const userId = req.user?.id; // Assuming you're attaching the authenticated user to req.user
            // const { userId } = req.body; // Ngambil dari body dulu, karena belum ada authentication
            const userId = String(req.body.userId);
            if (!req.file) {
                return next(new Error("Payment proof image is required"));
            }
            if (!userId) {
                return next(new Error("Unauthorized: User ID missing"));
            }
            const updatedTransaction = yield (0, transaction_service_1.PaymentTransactionService)({
                transactionId: String(transactionId),
                userId,
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
            const { transactionId } = req.params;
            const { action } = req.body;
            // Get the user ID from the authenticated user
            const userId = req.user.id;
            // Call the service with the correct parameter name
            const updatedTransaction = yield (0, transaction_service_1.EOActionTransactionService)({
                transactionId: String(transactionId),
                userId, // This should match the parameter name in your service
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
