// src/validations/event.validation.ts

import { z } from "zod";

// Mirror your Prisma “category” enum
export const categoryEnum = z.enum([
  "Concert",
  "Festival",
  "Comedy",
  "Museum",
  "Others",
]);

export const createEventSchema = z
  .object({
    name: z.string().min(1, "Event name is required"),
    startDate: z
      .string()
      .refine((s) => !isNaN(Date.parse(s)), "Invalid date")
      .transform((s) => new Date(s)),
    endDate: z
      .string()
      .refine((s) => !isNaN(Date.parse(s)), "Invalid date")
      .transform((s) => new Date(s)),
    description: z.string().min(1, "Description is required"),
    eventImage: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
    location: z.string().min(1, "Location is required"),
    price: z
      .number({ invalid_type_error: "Price must be a number" })
      .int("Price must be an integer")
      .min(0, "Price cannot be negative"),
    totalSeats: z
      .number({ invalid_type_error: "Total seats must be a number" })
      .int("Total seats must be an integer")
      .min(1, "At least one seat is required"),
    category: categoryEnum,
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must come after start date",
    path: ["endDate"],
  });
