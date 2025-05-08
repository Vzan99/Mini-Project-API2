"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileManagement_controller_1 = require("../controllers/profileManagement.controller");
const reqValidator_middleware_1 = __importDefault(require("../middlewares/reqValidator.middleware"));
const profileManagement_schema_1 = require("../schemas/profileManagement.schema");
const multer_1 = require("../utils/multer");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/forgot-password", (0, reqValidator_middleware_1.default)(profileManagement_schema_1.forgotPasswordSchema), profileManagement_controller_1.ForgotPasswordController);
router.post("/verify-token", profileManagement_controller_1.VerifyResetTokenController);
router.post("/reset-password", (0, reqValidator_middleware_1.default)(profileManagement_schema_1.resetPasswordSchema), profileManagement_controller_1.ResetPasswordController);
router.post("/change-password", auth_middleware_1.TokenVerification, (0, reqValidator_middleware_1.default)(profileManagement_schema_1.changePasswordSchema), profileManagement_controller_1.ChangePasswordController);
router.put("/update", auth_middleware_1.TokenVerification, (0, reqValidator_middleware_1.default)(profileManagement_schema_1.updateProfileSchema), profileManagement_controller_1.UpdateProfileController);
router.post("/upload-picture", auth_middleware_1.TokenVerification, (0, multer_1.Multer)().single("profile_picture"), profileManagement_controller_1.UploadProfilePictureController);
exports.default = router;
