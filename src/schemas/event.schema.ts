import { z } from "zod";
import { category } from "@prisma/client";

export const createEventSchema = z
  .object({
    name: z
      .string()
      .min(1, "Event name is required")
      .max(100, "Event name is too long"),

    startDate: z.coerce
      .date({
        errorMap: () => ({ message: "Start date must be a valid date" }),
      })
      .refine((date) => date > new Date(), {
        message: "Start date must be in the future",
      }),

    endDate: z.coerce.date({
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

    totalSeats: z.coerce
      .number({
        errorMap: () => ({ message: "Total seats must be a number" }),
      })
      .int("Total seats must be an integer")
      .min(1, "At least one seat is required"),

    category: z.nativeEnum(category, {
      errorMap: () => ({ message: "Invalid event category" }),
    }),
  })
  .refine((data) => data.endDate > data.startDate, {
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
    minPrice: z.coerce
      .number()
      .min(0, "Minimum price cannot be negative")
      .optional(),
    maxPrice: z.coerce
      .number()
      .min(0, "Maximum price cannot be negative")
      .optional(),
    startDate: z.coerce
      .date({
        errorMap: () => ({ message: "Start date must be a valid date" }),
      })
      .optional()
      .default(() => new Date()),
    endDate: z.coerce.date().optional(),
    availableSeatsOnly: z.boolean().optional().default(false),
    freeOnly: z.boolean().optional().default(false),
    specificDate: z.coerce.date().optional(),
    sortBy: z
      .enum(["name", "price", "start_date", "location", "created_at"], {
        errorMap: () => ({ message: "Invalid sort field" }),
      })
      .optional()
      .default("start_date"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().optional().default(10),
  })
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
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
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: "startDate must be before endDate",
      path: ["endDate"],
    }
  );
