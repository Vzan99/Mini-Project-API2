"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pastEventsSchema = exports.filterEventSchema = exports.eventIdSchema = exports.searchEventSchema = exports.createEventSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createEventSchema = zod_1.z
    .object({
    name: zod_1.z
        .string()
        .min(1, "Event name is required")
        .max(100, "Event name is too long"),
    start_date: zod_1.z.coerce
        .date({
        errorMap: () => ({ message: "Start date must be a valid date" }),
    })
        .refine((date) => date > new Date(), {
        message: "Start date must be in the future",
    }),
    end_date: zod_1.z.coerce.date({
        errorMap: () => ({ message: "End date must be a valid date" }),
    }),
    description: zod_1.z
        .string()
        .min(1, "Description is required")
        .max(2000, "Description is too long"),
    location: zod_1.z
        .string()
        .min(1, "Location is required")
        .max(100, "Location is too long"),
    price: zod_1.z.coerce
        .number({
        errorMap: () => ({ message: "Price must be a number" }),
    })
        .int("Price must be an integer")
        .min(0, "Price cannot be negative"),
    total_seats: zod_1.z.coerce
        .number({
        errorMap: () => ({ message: "Total seats must be a number" }),
    })
        .int("Total seats must be an integer")
        .min(1, "At least one seat is required"),
    category: zod_1.z.nativeEnum(client_1.category, {
        errorMap: () => ({ message: "Invalid event category" }),
    }),
})
    .refine((data) => data.end_date > data.start_date, {
    message: "End date must come after start date",
    path: ["endDate"],
});
exports.searchEventSchema = zod_1.z.object({
    query: zod_1.z.string().min(1, "Search query is required"),
    limit: zod_1.z.coerce.number().positive().optional().default(10),
    page: zod_1.z.coerce.number().positive().optional().default(1),
});
exports.eventIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid event ID format"),
});
exports.filterEventSchema = zod_1.z
    .object({
    keyword: zod_1.z.string().optional(),
    category: zod_1.z
        .nativeEnum(client_1.category, {
        errorMap: () => ({ message: "Invalid event category" }),
    })
        .optional(),
    location: zod_1.z.string().optional(),
    min_price: zod_1.z.coerce
        .number()
        .min(0, "Minimum price cannot be negative")
        .optional(),
    max_price: zod_1.z.coerce
        .number()
        .min(0, "Maximum price cannot be negative")
        .optional(),
    start_date: zod_1.z.coerce
        .date({
        errorMap: () => ({ message: "Start date must be a valid date" }),
    })
        .optional()
        .default(() => new Date()),
    end_date: zod_1.z.coerce.date().optional(),
    available_seats_only: zod_1.z.boolean().optional().default(false),
    free_only: zod_1.z.boolean().optional().default(false),
    specific_date: zod_1.z.coerce.date().optional(),
    sort_by: zod_1.z
        .enum(["name", "price", "start_date", "location", "created_at"], {
        errorMap: () => ({ message: "Invalid sort field" }),
    })
        .optional()
        .default("start_date"),
    sort_order: zod_1.z.enum(["asc", "desc"]).optional().default("asc"),
    page: zod_1.z.coerce.number().positive().optional().default(1),
    limit: zod_1.z.coerce.number().positive().optional().default(10),
})
    .refine((data) => {
    if (data.min_price !== undefined && data.max_price !== undefined) {
        return data.min_price <= data.max_price;
    }
    return true;
}, {
    message: "minPrice must be less than or equal to maxPrice",
    path: ["maxPrice"],
})
    .refine((data) => {
    if (data.start_date && data.end_date) {
        return data.start_date <= data.end_date;
    }
    return true;
}, {
    message: "startDate must be before endDate",
    path: ["endDate"],
});
exports.pastEventsSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().positive().optional().default(1),
    limit: zod_1.z.coerce.number().positive().optional().default(10),
});
