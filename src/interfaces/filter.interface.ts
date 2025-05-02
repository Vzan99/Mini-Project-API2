import { category } from "@prisma/client";

export interface FilterParams {
  keyword?: string; // Keyword to search in name or description
  category?: category; // Category to filter events by
  location?: string; // Location to filter events by
  minPrice?: number; // Minimum price to filter events by
  maxPrice?: number; // Maximum price to filter events by
  startDate?: Date; // Start date to filter events from
  endDate?: Date; // End date to filter events until
  sortBy?: string; // Field to sort the events by (e.g., 'start_date', 'price', 'name')
  sortOrder?: "asc" | "desc"; // Sorting order ('asc' or 'desc')
  page?: number; // Page number for pagination (default is 1)
  limit?: number; // Number of events per page (default is 10)
}
