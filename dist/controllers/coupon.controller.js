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
exports.CheckCouponValidityController = CheckCouponValidityController;
const coupon_service_1 = require("../services/coupon.service");
function CheckCouponValidityController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { user_id, coupon_code } = req.query;
            if (!user_id ||
                !coupon_code ||
                typeof user_id !== "string" ||
                typeof coupon_code !== "string") {
                throw new Error("User ID and coupon code are required");
            }
            const result = yield (0, coupon_service_1.CheckCouponValidityService)(user_id, coupon_code);
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
