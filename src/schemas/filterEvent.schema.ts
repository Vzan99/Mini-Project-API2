import { z } from "zod";
import { category } from "@prisma/client";

export const eventFilterSchema = z
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
