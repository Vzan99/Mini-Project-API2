import z from "zod";

export const updateProfileSchema = z
  .object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    username: z
      .string()
      .min(5, "Username must be at least 5 characters")
      .optional(),
  })
  .refine(
    (data) => {
      // Pastikan setidaknya satu field diisi
      return Object.values(data).some((value) => value !== undefined);
    },
    {
      message: "At least one field must be provided",
      path: [],
    }
  );

export const changePasswordSchema = z.object({
  current_password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    )
    .nonempty(),
  new_password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    )
    .nonempty(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email format")
    .nonempty("Email is required"),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email format")
    .nonempty("Email is required"),
  reset_token: z.string().nonempty("Reset token is required"),
  new_password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
});
