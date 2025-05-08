"use strict";
// buat akses database doang
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllUsersService = GetAllUsersService;
const prisma_1 = __importDefault(require("../lib/prisma"));
// Existing service functions...
function GetAllUsersService() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield prisma_1.default.user.findMany({
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    username: true,
                    user_referral_code: true,
                    profile_picture: true,
                    role: true,
                    created_at: true,
                    updated_at: true,
                },
                orderBy: {
                    created_at: "desc",
                },
            });
            return users;
        }
        catch (err) {
            throw err;
        }
    });
}
