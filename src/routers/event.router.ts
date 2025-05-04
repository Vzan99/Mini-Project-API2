import { Router } from "express";
import { CreateEventController } from "../controllers/event.controller";
import ReqValidator from "../middlewares/reqValidator.middleware";
import { createEventSchema } from "../schemas/event.schema";
import { Multer } from "../utils/multer";
import { GetEventByIdController } from "../controllers/event.controller";
import { TokenVerification } from "../middlewares/auth.middleware";
import { RoleChecker } from "../middlewares/roleChecker.middleware";

const router = Router();

router.get("/:id", GetEventByIdController);

//Create Event
router.post(
  "/",
  TokenVerification,
  RoleChecker(["event_organizer", "dev_admin"]),
  Multer().single("eventImage"),
  ReqValidator(createEventSchema),
  CreateEventController
);

export default router;
