// buat akses database doang

import prisma from "../lib/prisma";

// Existing service functions...

async function GetAllUsersService() {
  try {
    const users = await prisma.user.findMany({
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
  } catch (err) {
    throw err;
  }
}

export { GetAllUsersService };
