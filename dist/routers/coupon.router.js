"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coupon_controller_1 = require("../controllers/coupon.controller");
const queryValidator_middleware_1 = __importDefault(require("../middlewares/queryValidator.middleware"));
const coupon_schema_1 = require("../schemas/coupon.schema");
const router = (0, express_1.Router)();
// Add the endpoint for checking coupon validity
router.get("/check", (0, queryValidator_middleware_1.default)(coupon_schema_1.CheckCouponSchema), coupon_controller_1.CheckCouponValidityController);
exports.default = router;
