import { Schema, z } from "zod";
import { role } from "@prisma/client";

export const registerSchema = z.object({
  email: z.string().email("Invalid email format").trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    )
    .nonempty("Password is required"),
  first_name: z.string().nonempty("First name is required"),
  last_name: z.string().nonempty("Last name is required"),
  username: z
    .string()
    .min(5, "Username must be at least 5 characters")
    .nonempty("Username is required"),
  referral_code: z.string().optional(),
  role: z.nativeEnum(role).optional(),
});
export const loginSchema = z.object({
  email: z.string().email("invalid email format").trim(),
  password: z.string().nonempty("Password is required"),
});
