import { Request, Response, NextFunction } from "express";

import { LoginService, RegisterService } from "../services/auth.service";

async function RegisterController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await RegisterService(req.body);
    res.status(201).send({
      message: "Register Success!",
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function LoginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await LoginService(req.body);
    res.status(201).send({
      message: "Login Success!",
      user: data,
    });
  } catch (err) {
    next(err);
  }
}

export { RegisterController, LoginController };
