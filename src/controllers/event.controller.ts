import { Request, Response, NextFunction } from "express";
import { CreateEventService } from "../services/event.service";

async function CreateEventController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await CreateEventService(req.body);

    res.status(201).send({
      message: "Create Event Success!",
      data,
    });
  } catch (err) {
    next(err);
  }
}

export { CreateEventController };
