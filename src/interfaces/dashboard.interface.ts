import { transaction_status, category } from "@prisma/client";

// Filter waktu dengan detail
export interface IDateFilterParams {
  filter_type?: "day" | "week" | "month" | "year";
  year?: number;
  month?: number;
  day?: number;
}

// Statistik event
export interface IEventStatistics {
  total_events: number;
  total_attendees: number;
  total_revenue: number;
  events_by_category: Array<{
    category: string;
    count: number;
  }>;
  recent_transactions: Array<{
    id: string;
    event_name: string;
    customer_name: string;
    amount: number;
    status: transaction_status;
    date: Date;
  }>;
  time_series_data: Array<{
    date: string;
    events: number;
    attendees: number;
    revenue: number;
  }>;
}

// Event organizer
export interface IOrganizerEvent {
  id: string;
  name: string;
  start_date: Date;
  end_date: Date;
  location: string;
  price: number;
  total_seats: number;
  remaining_seats: number;
  category: category;
  event_image: string | null;
  _count: {
    transactions: number;
  };
}

// Transaksi event
export interface IEventTransaction {
  id: string;
  event: {
    name: string;
    event_image: string | null;
  };
  user: {
    username: string;
    email: string;
  };
  quantity: number;
  unit_price: number;
  total_pay_amount: number;
  status: transaction_status;
  created_at: Date;
  payment_proof: string | null;
}

// Data update event
export interface IEventUpdateData {
  name?: string;
  description?: string;
  start_date?: Date;
  end_date?: Date;
  location?: string;
  price?: number;
  total_seats?: number;
  category?: category;
}

export interface IUpdateEventImageParam {
  organizer_id: string;
  event_id: string;
  file: Express.Multer.File;
}
