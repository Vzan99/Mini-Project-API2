import { Router } from "express";
import {
  GetOrganizerProfileController,
  GetCardSectionsController,
} from "../controllers/admin.controller";

const router = Router();

// Get Organizers data
router.get("/organizers/:id", GetOrganizerProfileController);

// Get Card data for Each Sections
router.get("/sections", GetCardSectionsController);

export default router;
