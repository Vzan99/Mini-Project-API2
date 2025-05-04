import { Request, Response, NextFunction } from "express";
import {
  forgotPasswordService,
  verifyResetTokenService,
  resetPasswordService,
  changePasswordService,
  updateProfileService,
  uploadProfilePictureService,
} from "../services/profileManagement.service";

async function ForgotPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await forgotPasswordService({ email: req.body.email });
    res.status(200).json({
      status: "success",
      message: "Password reset email sent",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function VerifyResetTokenController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, reset_token } = req.body;
    const result = await verifyResetTokenService({ email, reset_token });
    res.status(200).json({
      status: "success",
      message: "Reset token is valid",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function ResetPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, reset_token, newPassword } = req.body;
    const result = await resetPasswordService({
      email,
      reset_token,
      newPassword,
    });
    res.status(200).json({
      status: "success",
      message: "Password has been reset successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function ChangePasswordController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    const result = await changePasswordService({
      id: userId,
      current_password,
      new_password,
    });

    res.status(200).json({
      status: "success",
      message: "Password has been changed successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function UpdateProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user.id;
    const { first_name, last_name, username } = req.body;

    const result = await updateProfileService({
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
  } catch (err) {
    next(err);
  }
}

async function UploadProfilePictureController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user.id;

    if (!req.file) {
      throw new Error("file not found");
    }

    const result = await uploadProfilePictureService({
      id: userId,
      file: req.file,
    });

    res.status(200).json({
      status: "success",
      message: "Profile picture updated successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export {
  ForgotPasswordController,
  VerifyResetTokenController,
  ResetPasswordController,
  ChangePasswordController,
  UpdateProfileController,
  UploadProfilePictureController,
};
