import { category } from "@prisma/client";

export interface FilterParams {
  keyword?: string; // Keyword to search in name or description
  category?: category; // Category to filter events by
  location?: string; // Location to filter events by
  min_price?: number; // Minimum price to filter events by
  max_price?: number; // Maximum price to filter events by
  start_date?: Date; // Start date to filter events from
  end_date?: Date; // End date to filter events until
  specific_date?: Date; // Specific date to find events occurring on
  available_seats_only?: boolean; // Filter to show only events with available seats
  free_only?: boolean; // Filter to show only free events
  sort_by?: string; // Field to sort results by
  sort_order?: "asc" | "desc"; // Sort order (asc/desc)
  page?: number; // Page number
  limit?: number; // Results per page
}
