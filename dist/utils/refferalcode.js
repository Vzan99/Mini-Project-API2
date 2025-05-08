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
exports.generateUniqueReferralCode = generateUniqueReferralCode;
exports.findUserByReferralCode = findUserByReferralCode;
const crypto_1 = require("crypto");
const prisma_1 = __importDefault(require("../lib/prisma"));
function generateUniqueReferralCode() {
    return __awaiter(this, arguments, void 0, function* (length = 6) {
        try {
            // Gunakan hanya huruf kapital untuk konsistensi
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let isUnique = false;
            let code = "";
            while (!isUnique) {
                code = "";
                for (let i = 0; i < length; i++) {
                    // Generate random byte
                    const byte = (0, crypto_1.randomBytes)(1)[0];
                    // modulo untuk menghasilkan indeks karakter yang valid
                    const index = byte % characters.length;
                    // add the character to the code
                    code += characters[index];
                }
                // Check if code already exists (case insensitive)
                const existingUser = yield prisma_1.default.user.findFirst({
                    where: {
                        user_referral_code: {
                            equals: code,
                            mode: "insensitive", // Gunakan mode insensitive untuk case-insensitive search
                        },
                    },
                });
                if (!existingUser) {
                    isUnique = true;
                }
            }
            return code;
        }
        catch (err) {
            console.log("Error generating referral code:", err);
            throw new Error("Failed to generate referral code");
        }
    });
}
/**
 * Fungsi untuk mencari user berdasarkan referral code (case insensitive)
 */
function findUserByReferralCode(referralCode) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Konversi ke uppercase untuk konsistensi
            const upperCaseCode = referralCode.toUpperCase();
            const user = yield prisma_1.default.user.findFirst({
                where: {
                    user_referral_code: {
                        equals: upperCaseCode,
                        mode: "insensitive", // Gunakan mode insensitive untuk case-insensitive search
                    },
                },
                select: {
                    id: true,
                },
            });
            return user;
        }
        catch (err) {
            console.log("Error finding user by referral code:", err);
            throw new Error("Failed to find user by referral code");
        }
    });
}
