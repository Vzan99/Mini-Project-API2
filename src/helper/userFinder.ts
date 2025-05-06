import prisma from "../lib/prisma";

export async function findUserByEmail(email: string) {
  try {
    // find user by email using prisma and show only email, first_name, last_name, password, and role
    const user = await prisma.user.findFirst({
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
  } catch (err) {
    throw err;
  }
}

export async function findUserByUsername(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    return user;
  } catch (err) {
    throw err;
  }
}

export async function findOrganizerById(id: string) {
  try {
    // Find user by ID and verify they have the event_organizer role
    const organizer = await prisma.user.findFirst({
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
  } catch (err) {
    throw err;
  }
}
