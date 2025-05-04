import { Request, Response, NextFunction } from "express";
import { role } from "@prisma/client";

export function RoleChecker(roles: role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user exists in request
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    // Check if user role is in allowed roles
    if (!roles.includes(req.user.role as role)) {
      throw new Error("Unauthorized");
    }

    next();
  };
}
