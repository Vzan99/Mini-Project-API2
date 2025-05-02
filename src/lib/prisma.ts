import { PrismaClient } from "@prisma/client";

// Force using only the DIRECT_URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

export default prisma;
