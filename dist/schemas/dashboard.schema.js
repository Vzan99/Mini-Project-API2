"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// Schema untuk validasi update event
exports.updateEventSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(3).max(100).optional(),
    description: zod_1.z.string().min(10).optional(),
    start_date: zod_1.z.coerce.date().optional(),
    end_date: zod_1.z.coerce.date().optional(),
    location: zod_1.z.string().min(3).max(100).optional(),
    price: zod_1.z.number().min(0).optional(),
    total_seats: zod_1.z.number().int().min(1).optional(),
    category: zod_1.z.nativeEnum(client_1.category).optional(),
})
    .refine((data) => {
    // Jika ada start_date dan end_date, pastikan end_date setelah start_date
    if (data.start_date && data.end_date) {
        return data.end_date > data.start_date;
    }
    return true;
}, {
    message: "End date must be after start date",
    path: ["end_date"],
});
