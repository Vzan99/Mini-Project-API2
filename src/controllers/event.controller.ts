import { Request, Response, NextFunction } from "express";
import { CreateEventService } from "../services/event.service";

async function CreateEventController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const event = await CreateEventService({
      ...req.body,
      file: req.file, // Multer-attached file
      organizerId: req.body?.id, // alwi: menambahkan userid
    });

    res.status(201).json({
      message: "Event created successfully",
      data: event,
    });
  } catch (err) {
    next(err);
  }
}

export { CreateEventController };
