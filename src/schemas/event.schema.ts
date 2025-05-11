import { z } from "zod";
import { category } from "@prisma/client";

export const createEventSchema = z
  .object({
    name: z
      .string()
      .min(1, "Event name is required")
      .max(100, "Event name is too long"),

    start_date: z.coerce
      .date({
        errorMap: () => ({ message: "Start date must be a valid date" }),
      })
      .refine((date) => date > new Date(), {
        message: "Start date must be in the future",
      }),

    end_date: z.coerce.date({
      errorMap: () => ({ message: "End date must be a valid date" }),
    }),

    description: z
      .string()
      .min(1, "Description is required")
      .max(2000, "Description is too long"),

    location: z
      .string()
      .min(1, "Location is required")
      .max(100, "Location is too long"),

    price: z.coerce
      .number({
        errorMap: () => ({ message: "Price must be a number" }),
      })
      .int("Price must be an integer")
      .min(0, "Price cannot be negative"),

    total_seats: z.coerce
      .number({
        errorMap: () => ({ message: "Total seats must be a number" }),
      })
      .int("Total seats must be an integer")
      .min(1, "At least one seat is required"),

    category: z.nativeEnum(category, {
      errorMap: () => ({ message: "Invalid event category" }),
    }),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: "End date must come after start date",
    path: ["endDate"],
  });

export const searchEventSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.coerce.number().positive().optional().default(10),
  page: z.coerce.number().positive().optional().default(1),
});

export const eventIdSchema = z.object({
  id: z.string().uuid("Invalid event ID format"),
});

export const filterEventSchema = z
  .object({
    keyword: z.string().optional(),
    category: z
      .nativeEnum(category, {
        errorMap: () => ({ message: "Invalid event category" }),
      })
      .optional(),
    location: z.string().optional(),
    min_price: z.coerce
      .number()
      .min(0, "Minimum price cannot be negative")
      .optional(),
    max_price: z.coerce
      .number()
      .min(0, "Maximum price cannot be negative")
      .optional(),
    start_date: z.coerce
      .date({
        errorMap: () => ({ message: "Start date must be a valid date" }),
      })
      .optional()
      .default(() => new Date()),
    end_date: z.coerce.date().optional(),
    available_seats_only: z.boolean().optional().default(false),
    free_only: z.boolean().optional().default(false),
    specific_date: z.coerce.date().optional(),
    sort_by: z
      .enum(["name", "price", "start_date", "location", "created_at"], {
        errorMap: () => ({ message: "Invalid sort field" }),
      })
      .optional()
      .default("start_date"),
    sort_order: z.enum(["asc", "desc"]).optional().default("asc"),
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().optional().default(10),
  })
  .refine(
    (data) => {
      if (data.min_price !== undefined && data.max_price !== undefined) {
        return data.min_price <= data.max_price;
      }
      return true;
    },
    {
      message: "minPrice must be less than or equal to maxPrice",
      path: ["maxPrice"],
    }
  )
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return data.start_date <= data.end_date;
      }
      return true;
    },
    {
      message: "startDate must be before endDate",
      path: ["endDate"],
    }
  );
