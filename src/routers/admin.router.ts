import { Router } from "express";
import {
  GetOrganizerProfileController,
  GetCardSectionsController,
  GetUniqueLocationsController,
  GetUserProfileController,
} from "../controllers/admin.controller";
import { TokenVerification } from "../middlewares/auth.middleware";

const router = Router();

// Get Organizers data
router.get("/organizers/:id", GetOrganizerProfileController);

// Get Card data for Each Sections (Only for home page)
router.get("/sections", GetCardSectionsController);

// Get unique locations for filtering
router.get("/locations", GetUniqueLocationsController);

// Get user profile for transaction
router.get("/profile", TokenVerification, GetUserProfileController);

export default router;
