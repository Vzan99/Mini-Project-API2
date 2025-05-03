import { Router } from "express";
import {
  RegisterController,
  LoginController,
} from "../controllers/auth.controller";
import ReqValidator from "../middlewares/reqValidator.middleware";
import { registerSchema, loginSchema } from "../schemas/user.schema";

const router = Router();

// Pastikan middleware validator digunakan sebelum controller
router.post("/register", ReqValidator(registerSchema), RegisterController);
router.post("/login", ReqValidator(loginSchema), LoginController);

export default router;
