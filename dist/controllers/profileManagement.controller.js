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
exports.ForgotPasswordController = ForgotPasswordController;
exports.VerifyResetTokenController = VerifyResetTokenController;
exports.ResetPasswordController = ResetPasswordController;
exports.ChangePasswordController = ChangePasswordController;
exports.UpdateProfileController = UpdateProfileController;
exports.UploadProfilePictureController = UploadProfilePictureController;
exports.GetUserProfileWithPointsController = GetUserProfileWithPointsController;
const profileManagement_service_1 = require("../services/profileManagement.service");
function ForgotPasswordController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, profileManagement_service_1.forgotPasswordService)({ email: req.body.email });
            res.status(200).json({
                status: "success",
                message: "Password reset email sent",
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function VerifyResetTokenController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, reset_token } = req.body;
            const result = yield (0, profileManagement_service_1.verifyResetTokenService)({ email, reset_token });
            res.status(200).json({
                status: "success",
                message: "Reset token is valid",
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function ResetPasswordController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, reset_token, new_password } = req.body;
            const result = yield (0, profileManagement_service_1.resetPasswordService)({
                email,
                reset_token,
                new_password,
            });
            res.status(200).json({
                status: "success",
                message: "Password has been reset successfully",
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function ChangePasswordController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user_id = req.user.id;
            const { current_password, new_password } = req.body;
            const result = yield (0, profileManagement_service_1.changePasswordService)({
                id: user_id,
                current_password,
                new_password,
            });
            res.status(200).json({
                status: "success",
                message: "Password has been changed successfully",
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function UpdateProfileController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.user.id;
            const { first_name, last_name, username } = req.body;
            const result = yield (0, profileManagement_service_1.updateProfileService)({
                id: userId,
                first_name,
                last_name,
                username,
            });
            res.status(200).json({
                status: "success",
                message: "Profile updated successfully",
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function UploadProfilePictureController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user_id = req.user.id;
            if (!req.file) {
                throw new Error("file not found");
            }
            const result = yield (0, profileManagement_service_1.uploadProfilePictureService)({
                id: user_id,
                file: req.file,
            });
            res.status(200).json({
                status: "success",
                message: "Profile picture updated successfully",
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function GetUserProfileWithPointsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.user.id;
            const result = yield (0, profileManagement_service_1.getUserProfileWithPointsService)(userId);
            res.status(200).json({
                status: "success",
                message: "User profile with points retrieved successfully",
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
