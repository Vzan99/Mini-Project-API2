"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const review_schema_1 = require("../schemas/review.schema");
const reqValidator_middleware_1 = __importDefault(require("../middlewares/reqValidator.middleware"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// POST /reviews - now with token verification
router.post("/", auth_middleware_1.TokenVerification, (0, reqValidator_middleware_1.default)(review_schema_1.createReviewSchema), review_controller_1.CreateReviewController);
exports.default = router;
