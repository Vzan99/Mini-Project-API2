"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewSchema = void 0;
const zod_1 = require("zod");
exports.createReviewSchema = zod_1.z.object({
    event_id: zod_1.z.string().uuid("Invalid event ID format"),
    rating: zod_1.z
        .number({
        required_error: "Rating is required",
        invalid_type_error: "Rating must be a number",
    })
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5"),
    review: zod_1.z
        .string()
        .min(1, "Review must not be empty")
        .max(1000, "Review is too long"),
});
