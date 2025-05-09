import { Request, Response, NextFunction } from "express";
import {
  CreateEventService,
  GetEventByIdService,
  SearchEventsService,
  FilterEventsService,
} from "../services/event.service";

async function CreateEventController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizerId = req.user.id;

    const event = await CreateEventService({
      ...req.body,
      file: req.file, // Multer-attached file
      organizerId, // alwi: menambahkan userid
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

export {
  CreateEventController,
  GetEventByIdController,
  SearchEventsController,
  FilterEventsController,
};
