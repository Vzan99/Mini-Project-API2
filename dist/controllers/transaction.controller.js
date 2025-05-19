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
exports.GenerateFreeTicketController = GenerateFreeTicketController;
const transaction_service_1 = require("../services/transaction.service");
function CreateTransactionController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user_id = req.user.id;
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
function PaymentTransactionController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const { id } = req.params;
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
            res.status(200).json({
                message: "Payment proof submitted successfully",
                data: updatedTransaction,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function EOActionTransactionController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { action } = req.body;
            const user_id = req.user.id;
            const updatedTransaction = yield (0, transaction_service_1.EOActionTransactionService)({
                id: String(id),
                user_id,
                action,
            });
            res.status(200).json({
                message: "Transaction status updated successfully",
                data: updatedTransaction,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function GetUserTicketsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user_id = req.user.id;
            const tickets = yield (0, transaction_service_1.GetUserTicketsService)(user_id);
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
function GenerateFreeTicketController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const user_id = req.user.id;
            const result = yield (0, transaction_service_1.GenerateFreeTicketService)(id, user_id);
            res.status(200).json({
                message: "Free Ticket Created Successfully",
                data: result.tickets,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
