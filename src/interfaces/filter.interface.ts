import { category } from "@prisma/client";

export interface FilterParams {
  keyword?: string; // Keyword to search in name or description
  category?: category; // Category to filter events by
  location?: string; // Location to filter events by
  minPrice?: number; // Minimum price to filter events by
  maxPrice?: number; // Maximum price to filter events by
  startDate?: Date; // Start date to filter events from
  endDate?: Date; // End date to filter events until
  specificDate?: Date; // Specific date to find events occurring on
  availableSeatsOnly?: boolean; // Filter to show only events with available seats
  freeOnly?: boolean; // Filter to show only free events
  sortBy?: string; // Field to sort results by
  sortOrder?: "asc" | "desc"; // Sort order (asc/desc)
  page?: number; // Page number
  limit?: number; // Results per page
}
