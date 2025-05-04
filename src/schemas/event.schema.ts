import { z } from "zod";
import { category } from "@prisma/client";

export const createEventSchema = z
  .object({
    name: z.string().min(1, "Event name is required"),

    startDate: z.coerce.date({
      errorMap: () => ({ message: "Start date must be a valid date" }),
    }),

    endDate: z.coerce.date({
      errorMap: () => ({ message: "End date must be a valid date" }),
    }),

    description: z.string().min(1, "Description is required"),

    eventImage: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),

    location: z.string().min(1, "Location is required"),

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

    category: z.nativeEnum(category),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must come after start date",
    path: ["endDate"],
  });

export const searchEventSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.coerce.number().positive().optional().default(10),
});

export const eventIdSchema = z.object({
  id: z.string().uuid("Invalid event ID format"),
});

export const filterEventSchema = z
  .object({
    keyword: z.string().optional(), // search by name or description
    category: z.nativeEnum(category).optional(),
    location: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    startDate: z.coerce
      .date()
      .optional()
      .default(() => new Date()),
    endDate: z.coerce.date().optional(),
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
