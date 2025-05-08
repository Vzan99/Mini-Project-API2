"use strict";
// temporary untuk cek database
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllUsersController = GetAllUsersController;
const database_service_1 = require("../services/database.service");
// Existing controller functions...
function GetAllUsersController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield (0, database_service_1.GetAllUsersService)();
            res.status(200).json({
                message: "Users retrieved successfully",
                count: users.length,
                data: users,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
