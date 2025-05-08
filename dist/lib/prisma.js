"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Force using only the DIRECT_URL
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL,
        },
    },
});
exports.default = prisma;
