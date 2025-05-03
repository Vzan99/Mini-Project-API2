import { Request, Response, NextFunction } from "express";
import {
  CreateEventService,
  GetEventByIdService,
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
    const { id } = req.params;
    const event = await GetEventByIdService(id);

    res.status(200).json({
      message: "Event retrieved successfully",
      data: event,
    });
  } catch (err) {
    next(err);
  }
}
export { CreateEventController, GetEventByIdController };
