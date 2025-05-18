import { category } from "@prisma/client";

export interface FilterParams {
  keyword?: string; 
  category?: category; 
  location?: string; 
  min_price?: number; 
  max_price?: number; 
  start_date?: Date; 
  end_date?: Date; 
  specific_date?: Date; 
  available_seats_only?: boolean; 
  free_only?: boolean; 
  sort_by?: string; 
  sort_order?: "asc" | "desc"; 
  page?: number; 
  limit?: number; 
}
