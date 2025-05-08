"use strict";
// temporary untuk cek database
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_controller_1 = require("../controllers/database.controller");
const router = (0, express_1.Router)();
// Get all users
router.get("/", database_controller_1.GetAllUsersController);
exports.default = router;
