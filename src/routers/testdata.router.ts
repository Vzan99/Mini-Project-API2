// temporary untuk cek database

import { Router } from "express";
import { GetAllUsersController } from "../controllers/database.controller";
const router = Router();

// Get all users
router.get("/", GetAllUsersController);

export default router;
