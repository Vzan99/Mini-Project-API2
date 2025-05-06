import { Router } from "express";
import {
  GetOrganizerEventsController,
  GetEventStatisticsController,
  GetTransactionsController,
  GetEventDetailsController,
  UpdateEventController,
  UpdateEventImageController,
} from "../controllers/dashboard.controller";
import { TokenVerification } from "../middlewares/auth.middleware";
import { RoleChecker } from "../middlewares/roleChecker.middleware";
import ParamValidator from "../middlewares/paramValidator.middleware";
import ReqValidator from "../middlewares/reqValidator.middleware";
import { eventIdSchema } from "../schemas/event.schema";
import { updateEventSchema } from "../schemas/dashboard.schema";
import { Multer } from "../utils/multer";

const router = Router();

// Get all events created by the organizer
router.get(
  "/events",
  TokenVerification,
  RoleChecker(["event_organizer", "dev_admin"]),
  GetOrganizerEventsController
);

// Get statistics for events
router.get(
  "/statistics",
  TokenVerification,
  RoleChecker(["event_organizer", "dev_admin"]),
  GetEventStatisticsController
);

// Get all transactions for events
router.get(
  "/transactions",
  TokenVerification,
  RoleChecker(["event_organizer", "dev_admin"]),
  GetTransactionsController
);

// Get detailed information about a specific event
router.get(
  "/events/:id",
  TokenVerification,
  RoleChecker(["event_organizer", "dev_admin"]),
  ParamValidator(eventIdSchema),
  GetEventDetailsController
);

// Update an event
router.put(
  "/events/:id",
  TokenVerification,
  RoleChecker(["event_organizer", "dev_admin"]),
  ParamValidator(eventIdSchema),
  ReqValidator(updateEventSchema),
  UpdateEventController
);

// Update event image
router.put(
  "/events/:id/image",
  TokenVerification,
  RoleChecker(["event_organizer", "dev_admin"]),
  ParamValidator(eventIdSchema), // Validasi ID event
  Multer().single("eventImage"), // Handle file upload
  UpdateEventImageController
);
export default router;
