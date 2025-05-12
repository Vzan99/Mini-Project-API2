import { Request, Response, NextFunction } from "express";
import {
  CreateEventService,
  GetEventByIdService,
  SearchEventsService,
  FilterEventsService,
  GetPastEventsService,
} from "../services/event.service";

async function CreateEventController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizer_id = req.user.id;

    const event = await CreateEventService({
      ...req.body,
      file: req.file, // Multer-attached file
      organizer_id, // alwi: menambahkan userid
    });

    res.status(201).json({
      message: "Event created successfully",
      data: event,
    });
  } catch (err) {
    next(err);
  }
}

async function GetEventByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Use the validated params
    const { id } = (req as any).validatedParams;

    const event = await GetEventByIdService(id);

    res.status(200).json({
      message: "Event retrieved successfully",
      data: event,
    });
  } catch (err) {
    next(err);
  }
}

async function SearchEventsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Use the validated query parameters with the new name
    const { query, limit } = (req as any).validatedQuery;

    const events = await SearchEventsService(query, limit);

    res.status(200).json({
      message: "Search results retrieved successfully",
      count: events.length,
      data: events,
    });
  } catch (err) {
    next(err);
  }
}

async function FilterEventsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Since query parameters have already been validated by QueryValidator,
    // you can just pass them to the service directly.
    const filters = (req as any).validatedQuery;

    // Call the service to get filtered events
    const events = await FilterEventsService(filters);

    // Send response
    res.status(200).json({
      message: "Filtered events retrieved successfully",
      events,
    });
  } catch (err) {
    next(err); // Pass the error to the error handling middleware
  }
}

async function GetPastEventsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user.id;
    const { page, limit } = req.query;

    const pastEvents = await GetPastEventsService(
      userId,
      Number(page) || 1,
      Number(limit) || 10
    );

    res.status(200).json({
      message: "Past events retrieved successfully",
      data: pastEvents,
    });
  } catch (err) {
    next(err);
  }
}

export {
  CreateEventController,
  GetEventByIdController,
  SearchEventsController,
  FilterEventsController,
  GetPastEventsController,
};
