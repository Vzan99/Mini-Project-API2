import { Router } from "express";
import {
  GetOrganizerProfileController,
  GetCardSectionsController,
  GetUniqueLocationsController,
} from "../controllers/admin.controller";

const router = Router();

// Get Organizers data
router.get("/organizers/:id", GetOrganizerProfileController);

// Get Card data for Each Sections (Only for home page)
router.get("/sections", GetCardSectionsController);

// Get unique locations for filtering
router.get("/locations", GetUniqueLocationsController);

export default router;
