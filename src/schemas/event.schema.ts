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
