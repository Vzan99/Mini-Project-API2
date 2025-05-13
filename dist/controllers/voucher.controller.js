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
exports.CreateVoucherController = CreateVoucherController;
exports.CheckVoucherValidityController = CheckVoucherValidityController;
const voucher_service_1 = require("../services/voucher.service");
function CreateVoucherController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, voucher_service_1.CreateVoucherService)(req.body);
            res.status(201).send({
                message: "Create Voucher Success",
                data,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function CheckVoucherValidityController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { event_id, voucher_code } = req.query;
            if (!event_id ||
                !voucher_code ||
                typeof event_id !== "string" ||
                typeof voucher_code !== "string") {
                throw new Error("Event ID and voucher code are required");
            }
            const result = yield (0, voucher_service_1.CheckVoucherValidityService)(event_id, voucher_code);
            res.status(200).json({
                message: result.message,
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
