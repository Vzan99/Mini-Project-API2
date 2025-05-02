import { randomBytes } from "crypto";
import prisma from "../lib/prisma";

export async function generateUniqueReferralCode(length: number = 6) {
  try {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let isUnique = false;
    let code = "";

    while (!isUnique) {
      code = "";
      for (let i = 0; i < length; i++) {
        // Generate random byte
        const byte = randomBytes(1)[0];

        // modulo untuk menghasilkan indeks karakter yang valid
        const index = byte % characters.length;

        // add the character to the code
        code += characters[index];
      }

      // Check if code already exists
      const existingUser = await prisma.user.findFirst({
        where: { user_referral_code: code },
      });

      if (!existingUser) {
        isUnique = true;
      }
    }

    return code;
  } catch (err) {
    console.log("Error generating referral code:", err);
    throw new Error("Failed to generate referral code");
  }
}
