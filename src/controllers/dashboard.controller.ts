import { Request, Response, NextFunction } from "express";
import {
  GetOrganizerEventsService,
  GetEventStatisticsService,
  GetTransactionService,
  GetEventDetailsService,
  UpdateEventService,
  UpdateEventImageService,
} from "../services/dashboard.service";
import { IDateFilterParams } from "../interfaces/dashboard.interface";

/**
 * Get all events created by the logged-in organizer
 */
async function GetOrganizerEventsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizerId = req.user.id;
    const events = await GetOrganizerEventsService(organizerId);

    res.status(200).json({
      message: "Events retrieved successfully",
      data: events,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get statistics for events created by the logged-in organizer
 */
async function GetEventStatisticsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizerId = req.user.id;
    const { filterType, year, month, day } = req.query;

    // Build filter object from query parameters
    const timeFilter: IDateFilterParams = {};

    if (filterType) {
      timeFilter.filterType = filterType as "day" | "week" | "month" | "year";
    }

    if (year) timeFilter.year = parseInt(year as string);
    if (month) timeFilter.month = parseInt(month as string);
    if (day) timeFilter.day = parseInt(day as string);

    const statistics = await GetEventStatisticsService(
      organizerId,
      Object.keys(timeFilter).length > 0 ? timeFilter : undefined
    );

    res.status(200).json({
      message: "Statistics retrieved successfully",
      data: statistics,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all transactions for events created by the logged-in organizer
 */
async function GetTransactionsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizerId = req.user.id;
    const transactions = await GetTransactionService(organizerId);

    res.status(200).json({
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get detailed information about a specific event
 */
async function GetEventDetailsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizerId = req.user.id;
    const eventId = req.params.id;

    const eventDetails = await GetEventDetailsService(eventId, organizerId);

    res.status(200).json({
      message: "Event details retrieved successfully",
      data: eventDetails,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update an event
 */
async function UpdateEventController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizerId = req.user.id;
    const eventId = req.params.id;
    const updateData = req.body;

    const updatedEvent = await UpdateEventService(
      eventId,
      organizerId,
      updateData
    );

    res.status(200).json({
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (err) {
    next(err);
  }
}

async function UpdateEventImageController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizerId = req.user.id;
    const eventId = req.params.id;
    const file = req.file;

    if (!file) {
      throw new Error("No file was provided");
    }

    const updatedEvent = await UpdateEventImageService({
      organizerId,
      eventId,
      file,
    });

    res.status(200).json({
      message: "Event image updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
}

export {
  GetOrganizerEventsController,
  GetEventStatisticsController,
  GetTransactionsController,
  GetEventDetailsController,
  UpdateEventController,
  UpdateEventImageController,
};
