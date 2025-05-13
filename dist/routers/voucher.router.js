"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const voucher_controller_1 = require("../controllers/voucher.controller");
const reqValidator_middleware_1 = __importDefault(require("../middlewares/reqValidator.middleware"));
const queryValidator_middleware_1 = __importDefault(require("../middlewares/queryValidator.middleware"));
const voucher_schema_1 = require("../schemas/voucher.schema");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.TokenVerification, (0, reqValidator_middleware_1.default)(voucher_schema_1.CreateVoucherSchema), voucher_controller_1.CreateVoucherController);
// Add the new endpoint for checking voucher validity
router.get("/check", (0, queryValidator_middleware_1.default)(voucher_schema_1.CheckVoucherSchema), voucher_controller_1.CheckVoucherValidityController);
exports.default = router;
