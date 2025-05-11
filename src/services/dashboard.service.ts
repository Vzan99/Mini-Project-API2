import prisma from "../lib/prisma";
import { transaction_status } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { cloudinaryUpload, cloudinaryRemove } from "../utils/cloudinary";

import { BuildDateFilter } from "../helper/dateFilter";
import { generateTimeSeriesData } from "../helper/generateTimeSeriesData";
import {
  IEventStatistics,
  IDateFilterParams,
  IOrganizerEvent,
  IEventTransaction,
  IEventUpdateData,
  IUpdateEventImageParam,
} from "../interfaces/dashboard.interface";

/**
 * Retrieves all events created by a specific organizer
 *
 * @param organizerId - The UUID of the event organizer
 * @returns Array of events with selected fields and transaction count
 */
async function GetOrganizerEventsService(
  organizerId: string
): Promise<IOrganizerEvent[]> {
  try {
    const events = await prisma.event.findMany({
      where: { organizer_id: organizerId },
      select: {
        id: true,
        name: true,
        start_date: true,
        end_date: true,
        location: true,
        price: true,
        total_seats: true,
        remaining_seats: true,
        category: true,
        event_image: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return events as IOrganizerEvent[];
  } catch (err) {
    throw err;
  }
}

/**
 * Generates comprehensive statistics for an organizer's events
 *
 * @param organizerId - The UUID of the event organizer
 * @param timeFilter - Optional time range filter (day, week, month, year or specific date)
 * @returns Statistics object with totals and categorized data
 */
async function GetEventStatisticsService(
  organizerId: string,
  timeFilter?: IDateFilterParams
): Promise<IEventStatistics> {
  try {
    const dateFilter = await BuildDateFilter(timeFilter);
    const whereClause: Prisma.EventWhereInput = { organizer_id: organizerId };

    if (dateFilter) {
      whereClause.created_at = dateFilter;
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        transactions: {
          where: {
            status: transaction_status.confirmed,
          },
        },
      },
    });

    const total_events = events.length;
    let total_attendees = 0;
    let total_revenue = 0;
    const categoryMap = new Map<string, number>();

    events.forEach((event) => {
      const category = event.category.toString();
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);

      event.transactions.forEach((tx) => {
        total_attendees += tx.quantity;
        total_revenue += tx.total_pay_amount;
      });
    });

    const events_by_category = Array.from(categoryMap.entries()).map(
      ([category, count]) => ({
        category,
        count,
      })
    );

    const recentTransactions = await prisma.transaction.findMany({
      where: {
        event: {
          organizer_id: organizerId,
        },
        status: transaction_status.confirmed,
      },
      take: 5,
      orderBy: {
        created_at: "desc",
      },
      include: {
        event: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    const recent_transactions = recentTransactions.map((tx) => ({
      id: tx.id,
      event_name: tx.event.name,
      customer_name: tx.user.username,
      amount: tx.total_pay_amount,
      status: tx.status,
      date: tx.created_at,
    }));

    // Generate time series data for charts - sekarang menggunakan helper function
    const time_series_data = await generateTimeSeriesData(
      organizerId,
      timeFilter
    );

    return {
      total_events,
      total_attendees,
      total_revenue,
      events_by_category,
      recent_transactions,
      time_series_data,
    };
  } catch (err) {
    throw err;
  }
}

/**
 * Retrieves all transactions for events organized by a specific organizer
 *
 * @param organizerId - The UUID of the event organizer
 * @returns Array of transactions with event and user details
 */
async function GetTransactionService(
  organizerId: string
): Promise<IEventTransaction[]> {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        event: {
          organizer_id: organizerId,
        },
      },
      include: {
        event: {
          select: {
            name: true,
            event_image: true,
          },
        },
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return transactions as IEventTransaction[];
  } catch (err) {
    throw err;
  }
}

/**
 * Retrieves detailed information about a specific event
 *
 * @param eventId - The UUID of the event
 * @param organizerId - The UUID of the event organizer
 * @returns Detailed event object with transactions, reviews and vouchers
 */
async function GetEventDetailsService(eventId: string, organizerId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
        organizer_id: organizerId,
      },
      include: {
        transactions: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
        review: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
        voucher: true,
      },
    });

    if (!event) throw new Error("Event not found or you are not authorized");

    return event;
  } catch (err) {
    throw err;
  }
}

/**
 * Updates an event with new data
 *
 * @param eventId - The UUID of the event to update
 * @param organizerId - The UUID of the event organizer
 * @param updateData - Object containing fields to update
 * @returns Updated event object
 */
async function UpdateEventService(
  eventId: string,
  organizerId: string,
  updateData: IEventUpdateData
) {
  try {
    const existingEvent = await prisma.event.findUnique({
      where: {
        id: eventId,
        organizer_id: organizerId,
      },
    });

    if (!existingEvent) {
      throw new Error(
        "Event not found or you don't have permission to update it"
      );
    }

    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: updateData,
    });

    return updatedEvent;
  } catch (err) {
    throw err;
  }
}

async function UpdateEventImageService(param: IUpdateEventImageParam) {
  let imageUrl: string | null = null;
  let fileName = "";
  try {
    const { event_id, organizer_id, file } = param;

    // Check if event exists and organizer is the owner
    const event = await prisma.event.findUnique({
      where: {
        id: param.event_id,
      },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    if (event.organizer_id !== organizer_id) {
      throw new Error("You don't have permission to update this event");
    }

    // Upload new image to cloudinary
    if (file) {
      const { secure_url } = await cloudinaryUpload(file);
      imageUrl = secure_url;
      const splitUrl = secure_url.split("/");
      fileName = splitUrl[splitUrl.length - 1];
    } else {
      throw new Error("No file was provided");
    }

    // Use transaction for database operations avoiding orphaned file
    const result = await prisma.$transaction(async (t) => {
      // Get current event to check if we need to delete old event image
      const currentEvent = await t.event.findUnique({
        where: { id: event_id },
        select: { event_image: true },
      });

      // Update event's image
      const updatedEvent = await t.event.update({
        where: { id: event_id },
        data: {
          event_image: fileName,
        },
      });

      return {
        updatedEvent,
        oldImage: currentEvent?.event_image,
      };
    });

    // Remove old image if it exists
    try {
      if (result.oldImage) {
        await cloudinaryRemove(result.oldImage);
      }
    } catch (cleanupErr) {
      console.error("Failed to remove old image", cleanupErr);
      // Non-critical error, don't throw
    }

    // Return the updated event
    return result.updatedEvent;
  } catch (error) {
    // Cleanup Cloudinary if upload succeeded but something else failed
    if (imageUrl) {
      await cloudinaryRemove(imageUrl);
    }
    throw error;
  }
}

async function AcceptTransactionService(transactionId: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });
  } catch (err) {}
}

export {
  GetOrganizerEventsService,
  GetEventStatisticsService,
  GetTransactionService,
  GetEventDetailsService,
  UpdateEventService,
  UpdateEventImageService,
};
