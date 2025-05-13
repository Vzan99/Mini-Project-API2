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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckCouponValidityService = CheckCouponValidityService;
const prisma_1 = __importDefault(require("../lib/prisma"));
function CheckCouponValidityService(user_id, coupon_code) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Find the coupon by code and user ID
            const coupon = yield prisma_1.default.coupon.findFirst({
                where: {
                    user_id: user_id,
                    coupon_code: coupon_code,
                },
            });
            // If coupon doesn't exist
            if (!coupon) {
                return {
                    is_valid: false,
                    message: "Coupon not found",
                };
            }
            const now = new Date();
            // Check if coupon is within valid date range
            if (now < coupon.coupon_start_date) {
                return {
                    is_valid: false,
                    message: "Coupon is not yet active",
                    active_from: coupon.coupon_start_date,
                };
            }
            if (now > coupon.coupon_end_date) {
                return {
                    is_valid: false,
                    message: "Coupon has expired",
                    expired_at: coupon.coupon_end_date,
                };
            }
            // Check if coupon has reached max usage
            if (coupon.use_count >= coupon.max_usage) {
                return {
                    is_valid: false,
                    message: "Coupon has reached maximum usage limit",
                };
            }
            // Coupon is valid
            return {
                is_valid: true,
                message: "Coupon is valid",
                coupon_id: coupon.id,
                discount_amount: coupon.discount_amount,
                remaining_uses: coupon.max_usage - coupon.use_count,
            };
        }
        catch (err) {
            throw err;
        }
    });
}
