import { transaction_status, category } from "@prisma/client";

// Filter waktu dengan detail
export interface IDateFilterParams {
  filterType?: "day" | "week" | "month" | "year";
  year?: number;
  month?: number;
  day?: number;
}

// Statistik event
export interface IEventStatistics {
  totalEvents: number;
  totalAttendees: number;
  totalRevenue: number;
  eventsByCategory: Array<{
    category: string;
    count: number;
  }>;
  recentTransactions: Array<{
    id: string;
    eventName: string;
    customerName: string;
    amount: number;
    status: transaction_status;
    date: Date;
  }>;
  timeSeriesData: Array<{
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
  organizerId: string;
  eventId: string;
  file: Express.Multer.File;
}
