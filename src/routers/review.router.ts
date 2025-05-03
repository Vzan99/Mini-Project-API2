import { Router } from "express";
import { CreateReviewController } from "../controllers/review.controller";
import { createReviewSchema } from "../schemas/review.schema";
import ReqValidator from "../middlewares/reqValidator.middleware";

const router = Router();

// POST /reviews
router.post("/", ReqValidator(createReviewSchema), CreateReviewController);

export default router;
