import { Router } from "express";
import {
  GetOrganizerProfileController,
  FilterEventsController,
  GetCardSectionsController,
} from "../controllers/admin.controller";
import { eventFilterSchema } from "../schemas/filterEvent.schema";

import QueryValidator from "../middlewares/queryValidator.middleware";

const router = Router();

// Get Organizers data
router.get("/organizers/:id", GetOrganizerProfileController);

// Filter all events by category, location, date, and price using query
router.get(
  "/filter", // Endpoint for filtering events
  QueryValidator(eventFilterSchema), // Validate query parameters
  FilterEventsController // Your controller logic
);

// Get Card data for Each Sections
router.get("/sections", GetCardSectionsController);

export default router;
