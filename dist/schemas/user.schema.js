"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format").trim(),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
        .nonempty("Password is required"),
    first_name: zod_1.z.string().nonempty("First name is required"),
    last_name: zod_1.z.string().nonempty("Last name is required"),
    username: zod_1.z
        .string()
        .min(5, "Username must be at least 5 characters")
        .nonempty("Username is required"),
    referral_code: zod_1.z.string().optional(),
    role: zod_1.z.nativeEnum(client_1.role).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("invalid email format").trim(),
    password: zod_1.z.string().nonempty("Password is required"),
});
