import { Request, Response, NextFunction } from "express";
import { CreateEventService } from "../services/event.service";
import { cloudinaryUpload } from "../utils/cloudinary";

async function CreateEventController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const event = await CreateEventService({
      ...req.body,
      file: req.file, // Multer-attached file
    });

    res.status(201).json({
      message: "Event created successfully",
      data: event,
    });
  } catch (err) {
    next(err);
  }
}

//Just for exercise upload image
async function UpdateEventImageController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { file } = req;

    if (file) {
      const { secure_url } = await cloudinaryUpload(file);
      console.log(secure_url);
    }

    res.status(201).send({
      message: "Update Event Image Success!",
    });
  } catch (err) {
    next(err);
  }
}

export { CreateEventController, UpdateEventImageController };
