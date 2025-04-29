import { Router } from "express";
import { CreateEventController } from "../controllers/event.controller";
import ReqValidator from "../middlewares/validator.middleware";
import { createEventSchema } from "../schemas/event.schema";

const router = Router();

//Create Event
router.post("/", ReqValidator(createEventSchema), CreateEventController);

export default router;
