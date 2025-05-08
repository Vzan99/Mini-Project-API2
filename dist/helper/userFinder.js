"use strict";
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
exports.findUserByEmail = findUserByEmail;
exports.findUserByUsername = findUserByUsername;
exports.findOrganizerById = findOrganizerById;
const prisma_1 = __importDefault(require("../lib/prisma"));
function findUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // find user by email using prisma and show only email, first_name, last_name, password, and role
            const user = yield prisma_1.default.user.findFirst({
                select: {
                    id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    password: true,
                    role: true,
                },
                where: {
                    email,
                },
            });
            return user;
        }
        catch (err) {
            throw err;
        }
    });
}
function findUserByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma_1.default.user.findUnique({
                where: { username },
            });
            return user;
        }
        catch (err) {
            throw err;
        }
    });
}
function findOrganizerById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Find user by ID and verify they have the event_organizer role
            const organizer = yield prisma_1.default.user.findFirst({
                where: {
                    id,
                    role: "event_organizer",
                },
                select: {
                    id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    username: true,
                    role: true,
                    profile_picture: true,
                },
            });
            return organizer;
        }
        catch (err) {
            throw err;
        }
    });
}
