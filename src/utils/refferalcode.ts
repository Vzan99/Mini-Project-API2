import { randomBytes } from "crypto";
import prisma from "../lib/prisma";

export async function generateUniqueReferralCode(length: number = 6) {
  try {
    // Gunakan hanya huruf kapital untuk konsistensi
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

      // Check if code already exists (case insensitive)
      const existingUser = await prisma.user.findFirst({
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
  } catch (err) {
    console.log("Error generating referral code:", err);
    throw new Error("Failed to generate referral code");
  }
}

/**
 * Fungsi untuk mencari user berdasarkan referral code (case insensitive)
 */
export async function findUserByReferralCode(referralCode: string) {
  try {
    // Konversi ke uppercase untuk konsistensi
    const upperCaseCode = referralCode.toUpperCase();

    const user = await prisma.user.findFirst({
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
  } catch (err) {
    console.log("Error finding user by referral code:", err);
    throw new Error("Failed to find user by referral code");
  }
}
