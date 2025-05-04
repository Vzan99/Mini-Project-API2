import { Router } from "express";
import {
  ForgotPasswordController,
  VerifyResetTokenController,
  ResetPasswordController,
  ChangePasswordController,
  UpdateProfileController,
  UploadProfilePictureController,
} from "../controllers/profileManagement.controller";
import ReqValidator from "../middlewares/reqValidator.middleware";
import {
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/profileManagement.schema";
import { Multer } from "../utils/multer";

import { TokenVerification } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/forgot-password",
  ReqValidator(forgotPasswordSchema),
  ForgotPasswordController
);

router.post("/verify-token", VerifyResetTokenController);

router.post(
  "/reset-password",
  ReqValidator(resetPasswordSchema),
  ResetPasswordController
);

router.post(
  "/change-password",
  TokenVerification,
  ReqValidator(changePasswordSchema),
  ChangePasswordController
);

router.put(
  "/update",
  TokenVerification,
  ReqValidator(updateProfileSchema),
  UpdateProfileController
);

router.post(
  "/upload-picture",
  TokenVerification,
  Multer().single("profile_picture"),
  UploadProfilePictureController
);

export default router;

// https://yourdomain.com/reset-password?email=hansgotze99@gmail.com&token=47658ca925e0e680bb473f2e6938e25d89c0ce5b90d1693cbb5303be13e661bc
