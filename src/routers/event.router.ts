import { Router } from "express";
import {
  CreateEventController,
  UpdateEventImageController,
} from "../controllers/event.controller";
import ReqValidator from "../middlewares/validator.middleware";
import { createEventSchema } from "../schemas/event.schema";
import { Multer } from "../utils/multer";

const router = Router();

//Create Event
router.post("/", ReqValidator(createEventSchema), CreateEventController);

//Update foto event (just for exercise - without service)
router.patch("/image", Multer().single("file"), UpdateEventImageController);

export default router;
