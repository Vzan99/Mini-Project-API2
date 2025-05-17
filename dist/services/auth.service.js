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
exports.RegisterService = RegisterService;
exports.LoginService = LoginService;
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../config");
const nodemailer_1 = require("../utils/nodemailer");
const refferalcode_1 = require("../utils/refferalcode");
const userFinder_1 = require("../helper/userFinder");
// Registration email template embedded directly in the service
const registrationEmailTemplate = `
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Ticket</title>
  </head>
  <body>
    <div style="font-family: sans-serif; color: #333;">
      <h2 style="color: #4F46E5;">Welcome to Ticket 🎫</h2>
      <p>Hi USERNAME_PLACEHOLDER,</p>
      <p>Thank you for registering! Your account has been successfully created.</p>
      <p>Start exploring events, book your tickets, and be part of the
        experiences that matter.</p>
      <div style="margin: 24px 0;">
        <a
          href="https://yourdomain.com/login"
          style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px;"
        >
          Go to Dashboard
        </a>
      </div>
      <p>If you have any questions, feel free to reply to this email.</p>
      <p>Cheers,<br /><strong>Ticket Team</strong></p>
    </div>
  </body>
</html>
`;
function RegisterService(param) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //checking if the email is already exists
            const isEmailExist = yield (0, userFinder_1.findUserByEmail)(param.email);
            //if the email is already exists, throw an error
            if (isEmailExist) {
                throw new Error("Email already exists.");
            }
            //check if the username is already taken
            const isUsernameExist = yield (0, userFinder_1.findUserByUsername)(param.username);
            //if the username is already taken, throw an error
            if (isUsernameExist) {
                throw new Error("Username already taken.");
            }
            //find referrer if referral code is provided
            let refererId = null;
            if (param.referral_code) {
                // Gunakan fungsi baru yang case insensitive
                const referrer = yield (0, refferalcode_1.findUserByReferralCode)(param.referral_code);
                if (!referrer) {
                    throw new Error("Invalid referral code.");
                }
                refererId = referrer.id;
            }
            const userReferralCode = yield (0, refferalcode_1.generateUniqueReferralCode)();
            const user = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const salt = (0, bcrypt_1.genSaltSync)(10);
                const hashedPassword = yield (0, bcrypt_1.hash)(param.password, salt);
                //create new user
                const newUser = yield tx.user.create({
                    data: {
                        first_name: param.first_name,
                        last_name: param.last_name,
                        email: param.email,
                        password: hashedPassword,
                        username: param.username,
                        user_referral_code: userReferralCode,
                        referer_id: refererId,
                        role: param.role || "customer",
                    },
                });
                // handle referral rewards if refferal code was used by newUser
                if (refererId) {
                    // 1. Create referral record
                    yield tx.referral.create({
                        data: {
                            user_id_referer: refererId,
                            user_id_referred: newUser.id,
                            points_reward: 10000, // 10,000 points as per requirements
                        },
                    });
                    // 2. Award points to referrer (valid for 3 months)
                    const pointsExpiryDate = new Date();
                    pointsExpiryDate.setMonth(pointsExpiryDate.getMonth() + 3);
                    yield tx.points.create({
                        data: {
                            user_id: refererId,
                            points_amount: 10000,
                            credited_at: new Date(),
                            expires_at: pointsExpiryDate,
                            is_used: false,
                            is_expired: false,
                        },
                    });
                    // 3. Create discount coupon for new user (valid for 3 months)
                    const couponExpiryDate = new Date();
                    couponExpiryDate.setMonth(couponExpiryDate.getMonth() + 3);
                    yield tx.coupon.create({
                        data: {
                            user_id: newUser.id,
                            coupon_code: `COUP${userReferralCode}`,
                            discount_amount: 10000, // Example: 50,000 IDR discount
                            coupon_start_date: new Date(),
                            coupon_end_date: couponExpiryDate,
                            max_usage: 1, // One-time use
                            use_count: 0,
                        },
                    });
                }
                return newUser;
            }));
            // Ganti placeholder username dengan nilai sebenarnya
            const htmlContent = registrationEmailTemplate.replace("USERNAME_PLACEHOLDER", param.username || "there");
            yield nodemailer_1.transporter.sendMail({
                from: '"Ticket Admin" <no-reply@yourdomain.com>',
                to: param.email,
                subject: "🎉 Registration Successful — Welcome to Quick Ticket!",
                html: htmlContent,
            });
            return user;
        }
        catch (err) {
            throw err;
        }
    });
}
function LoginService(param) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //find user by email
            const user = yield (0, userFinder_1.findUserByEmail)(param.email);
            //if user not found, throw an error
            if (!user)
                throw new Error("User not found");
            //compare password with hashed password
            const isPasswordValid = yield (0, bcrypt_1.compare)(param.password, user.password);
            // if password is invalid, throw an error
            if (!isPasswordValid) {
                throw new Error("Invalid password");
            }
            //generate token
            const payload = {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
            };
            //generate token
            const token = (0, jsonwebtoken_1.sign)(payload, String(config_1.SECRET_KEY), { expiresIn: "1h" });
            //return token and user
            return { token, user: payload };
        }
        catch (err) {
            throw err;
        }
    });
}
