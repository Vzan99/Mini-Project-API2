import { z } from "zod";
import { category } from "@prisma/client";

// Schema untuk validasi update event
export const updateEventSchema = z
  .object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().min(10).optional(),
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional(),
    location: z.string().min(3).max(100).optional(),
    price: z.number().min(0).optional(),
    total_seats: z.number().int().min(1).optional(),
    category: z.nativeEnum(category).optional(),
  })
  .refine(
    (data) => {
      // Jika ada start_date dan end_date, pastikan end_date setelah start_date
      if (data.start_date && data.end_date) {
        return data.end_date > data.start_date;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    }
  );
