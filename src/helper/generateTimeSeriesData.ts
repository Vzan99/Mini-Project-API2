import prisma from "../lib/prisma";
import { Prisma, transaction_status } from "@prisma/client";
import { IDateFilterParams } from "../interfaces/dashboard.interface";
import { BuildDateFilter } from "./dateFilter";

export async function generateTimeSeriesData(
  organizerId: string,
  timeFilter?: IDateFilterParams
) {
  const dateFilter = await BuildDateFilter(timeFilter);
  const whereClause: Prisma.EventWhereInput = { organizer_id: organizerId };

  if (dateFilter) {
    whereClause.created_at = dateFilter;
  }

  // Get all events in the period
  const events = await prisma.event.findMany({
    where: whereClause,
    include: {
      transactions: {
        where: {
          status: transaction_status.confirmed,
        },
      },
    },
    orderBy: {
      start_date: "asc",
    },
  });

  // Group by day, month, or year based on timeFilter
  const groupBy = timeFilter?.filter_type || "month";

  // Define the type for seriesData to fix TypeScript errors
  interface SeriesDataItem {
    events: number;
    attendees: number;
    revenue: number;
  }

  const seriesData: Record<string, SeriesDataItem> = {};

  events.forEach((event) => {
    let dateKey;
    const date = new Date(event.start_date);

    if (groupBy === "day") {
      dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
    } else if (groupBy === "month") {
      dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`; // YYYY-MM
    } else {
      dateKey = date.getFullYear().toString(); // YYYY
    }

    if (!seriesData[dateKey]) {
      seriesData[dateKey] = {
        events: 0,
        attendees: 0,
        revenue: 0,
      };
    }

    // Count this event
    seriesData[dateKey].events += 1;

    // Add attendees and revenue from transactions
    event.transactions.forEach((tx) => {
      seriesData[dateKey].attendees += tx.quantity;
      seriesData[dateKey].revenue += tx.total_pay_amount;
    });
  });

  // Convert to array format for charts
  return Object.entries(seriesData).map(([date, data]) => ({
    date,
    ...data,
  }));
}
