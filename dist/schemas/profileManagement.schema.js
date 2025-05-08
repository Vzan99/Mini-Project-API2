"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.updateProfileSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.updateProfileSchema = zod_1.default
    .object({
    first_name: zod_1.default.string().optional(),
    last_name: zod_1.default.string().optional(),
    username: zod_1.default
        .string()
        .min(5, "Username must be at least 5 characters")
        .optional(),
})
    .refine((data) => {
    // Pastikan setidaknya satu field diisi
    return Object.values(data).some((value) => value !== undefined);
}, {
    message: "At least one field must be provided",
    path: [],
});
exports.changePasswordSchema = zod_1.default.object({
    current_password: zod_1.default
        .string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
        .nonempty(),
    new_password: zod_1.default
        .string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
        .nonempty(),
});
exports.forgotPasswordSchema = zod_1.default.object({
    email: zod_1.default
        .string()
        .trim()
        .email("Invalid email format")
        .nonempty("Email is required"),
});
exports.resetPasswordSchema = zod_1.default.object({
    email: zod_1.default
        .string()
        .trim()
        .email("Invalid email format")
        .nonempty("Email is required"),
    reset_token: zod_1.default.string().nonempty("Reset token is required"),
    newPassword: zod_1.default
        .string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});
