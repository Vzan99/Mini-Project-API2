// temporary untuk cek database

import { Request, Response, NextFunction } from "express";
import { GetAllUsersService } from "../services/database.service";
// Existing controller functions...

async function GetAllUsersController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await GetAllUsersService();

    res.status(200).json({
      message: "Users retrieved successfully",
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
}

export { GetAllUsersController };
