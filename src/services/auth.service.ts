import {
  ILoginParam,
  IRegisterParam,
  IJwtPayloadParam,
} from "../interfaces/user.interface";
import prisma from "../lib/prisma";
import { genSaltSync, hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";

import { SECRET_KEY } from "../config";
import { transporter } from "../utils/nodemailer";
import {
  generateUniqueReferralCode,
  findUserByReferralCode,
} from "../utils/refferalcode";

import { findUserByEmail, findUserByUsername } from "../helper/userFinder";

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

async function RegisterService(param: IRegisterParam) {
  try {
    //checking if the email is already exists
    const isEmailExist = await findUserByEmail(param.email);

    //if the email is already exists, throw an error
    if (isEmailExist) {
      throw new Error("Email already exists.");
    }

    //check if the username is already taken
    const isUsernameExist = await findUserByUsername(param.username);

    //if the username is already taken, throw an error
    if (isUsernameExist) {
      throw new Error("Username already taken.");
    }

    //find referrer if referral code is provided
    let refererId: string | null = null;
    if (param.referral_code) {
      // Gunakan fungsi baru yang case insensitive
      const referrer = await findUserByReferralCode(param.referral_code);

      if (!referrer) {
        throw new Error("Invalid referral code.");
      }

      refererId = referrer.id;
    }

    const userReferralCode = await generateUniqueReferralCode();

    const user = await prisma.$transaction(async (tx) => {
      const salt = genSaltSync(10);
      const hashedPassword = await hash(param.password, salt);

      //create new user
      const newUser = await tx.user.create({
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
        await tx.referral.create({
          data: {
            user_id_referer: refererId,
            user_id_referred: newUser.id,
            points_reward: 10000, // 10,000 points as per requirements
          },
        });

        // 2. Award points to referrer (valid for 3 months)
        const pointsExpiryDate = new Date();
        pointsExpiryDate.setMonth(pointsExpiryDate.getMonth() + 3);

        await tx.points.create({
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

        await tx.coupon.create({
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
    });

    // Ganti placeholder username dengan nilai sebenarnya
    const htmlContent = registrationEmailTemplate.replace(
      "USERNAME_PLACEHOLDER",
      param.username || "there"
    );

    await transporter.sendMail({
      from: '"Ticket Admin" <no-reply@yourdomain.com>',
      to: param.email,
      subject: "🎉 Registration Successful — Welcome to Quick Ticket!",
      html: htmlContent,
    });
    return user;
  } catch (err) {
    throw err;
  }
}

async function LoginService(param: ILoginParam) {
  try {
    //find user by email
    const user = await findUserByEmail(param.email);

    //if user not found, throw an error
    if (!user) throw new Error("User not found");

    //compare password with hashed password
    const isPasswordValid = await compare(param.password, user.password);

    // if password is invalid, throw an error
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    //generate token
    const payload: IJwtPayloadParam = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    };

    //generate token
    const token = sign(payload, String(SECRET_KEY), { expiresIn: "1h" });

    //return token and user
    return { token, user: payload };
  } catch (err) {
    throw err;
  }
}

export { RegisterService, LoginService };
