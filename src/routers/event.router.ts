import { Router } from "express";
import { CreateEventController } from "../controllers/event.controller";
import ReqValidator from "../middlewares/reqValidator.middleware";
import { createEventSchema } from "../schemas/event.schema";
import { Multer } from "../utils/multer";

const router = Router();

//Create Event
router.post(
  "/",
  Multer().single("eventImage"),
  ReqValidator(createEventSchema),
  CreateEventController
);

export default router;
