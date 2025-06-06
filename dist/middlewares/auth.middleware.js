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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenVerification = TokenVerification;
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../config");
function TokenVerification(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const token = (_a = req.header("authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
            if (!token)
                throw new Error("Unauthorized");
            const userVerification = (0, jsonwebtoken_1.verify)(token, String(config_1.SECRET_KEY));
            req.user = userVerification;
            next();
        }
        catch (err) {
            // return res.status(401).json({ message: "Invalid or expired token" });
            next(err);
        }
    });
}
