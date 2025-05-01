import { Router } from "express";
import { CreateReviewController } from "../controllers/review.controller";

const router = Router();

// POST /reviews
router.post("/", CreateReviewController);

export default router;
