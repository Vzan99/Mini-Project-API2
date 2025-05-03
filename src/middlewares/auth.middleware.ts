import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { SECRET_KEY } from "../config";

import { IJwtPayloadParam } from "../interfaces/user.interface";

async function TokenVerification(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.header("authorization")?.replace("Bearer ", "");

    if (!token) throw new Error("Unauthorized");

    const userVerification = verify(token, String(SECRET_KEY));

    req.user = userVerification as IJwtPayloadParam;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export { TokenVerification };
