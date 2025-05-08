"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const reqValidator_middleware_1 = __importDefault(require("../middlewares/reqValidator.middleware"));
const user_schema_1 = require("../schemas/user.schema");
const router = (0, express_1.Router)();
// Pastikan middleware validator digunakan sebelum controller
router.post("/register", (0, reqValidator_middleware_1.default)(user_schema_1.registerSchema), auth_controller_1.RegisterController);
router.post("/login", (0, reqValidator_middleware_1.default)(user_schema_1.loginSchema), auth_controller_1.LoginController);
exports.default = router;
