"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckCouponSchema = void 0;
const zod_1 = require("zod");
exports.CheckCouponSchema = zod_1.z.object({
    coupon_code: zod_1.z.string().min(1, { message: "Coupon code is required" }),
});
