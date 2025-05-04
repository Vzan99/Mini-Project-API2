import nodemailer from "nodemailer";
import { NODEMAILER_USER, NODEMAILER_PASSWORD } from "../config";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: NODEMAILER_USER,
    pass: NODEMAILER_PASSWORD,
  },
});
