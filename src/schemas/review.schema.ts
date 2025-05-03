import { z } from "zod";

export const createReviewSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  eventId: z.string().min(1, "Event ID is required"),
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
