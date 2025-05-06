import { z } from "zod";

export const createReviewSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  eventId: z.string().uuid("Invalid event ID format"),
  rating: z
    .number({
      required_error: "Rating is required",
      invalid_type_error: "Rating must be a number",
    })
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  review: z
    .string()
    .min(1, "Review must not be empty")
    .max(1000, "Review is too long"),
});
