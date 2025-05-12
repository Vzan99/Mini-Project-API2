import { Router } from "express";
import {
  CreateEventController,
  GetEventByIdController,
  SearchEventsController,
  FilterEventsController,
  GetPastEventsController,
} from "../controllers/event.controller";
import ReqValidator from "../middlewares/reqValidator.middleware";
import QueryValidator from "../middlewares/queryValidator.middleware";
import ParamValidator from "../middlewares/paramValidator.middleware";
import {
  createEventSchema,
  searchEventSchema,
  eventIdSchema,
  filterEventSchema,
  pastEventsSchema,
} from "../schemas/event.schema";
import { Multer } from "../utils/multer";
import { TokenVerification } from "../middlewares/auth.middleware";
import { RoleChecker } from "../middlewares/roleChecker.middleware";

const router = Router();

// Search events - with query validation
router.get(
  "/search",
  QueryValidator(searchEventSchema),
  SearchEventsController
);

// Filter all events by category, location, date, and price using query
router.get(
  "/filter", // Endpoint for filtering events
  QueryValidator(filterEventSchema), // Validate query parameters
  FilterEventsController // Your controller logic
);

// Get past events that the user has attended
router.get(
  "/past",
  TokenVerification,
  QueryValidator(pastEventsSchema),
  GetPastEventsController
);

// Get event by ID - with param validation
router.get("/:id", ParamValidator(eventIdSchema), GetEventByIdController);

// Create Event
router.post(
  "/",
  TokenVerification,
  RoleChecker(["event_organizer", "dev_admin"]),
  Multer().single("eventImage"),
  ReqValidator(createEventSchema),
  CreateEventController
);

export default router;
