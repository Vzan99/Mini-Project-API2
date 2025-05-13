"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Multer = Multer;
const multer_1 = __importDefault(require("multer"));
function Multer() {
    const storage = multer_1.default.memoryStorage();
    return (0, multer_1.default)({
        storage,
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    });
}
