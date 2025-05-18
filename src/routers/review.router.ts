import { Router } from "express";
import { CreateReviewController } from "../controllers/review.controller";
import { createReviewSchema } from "../schemas/review.schema";
import ReqValidator from "../middlewares/reqValidator.middleware";
import { TokenVerification } from "../middlewares/auth.middleware";

const router = Router();

// Create a review
router.post(
  "/",
  TokenVerification,
  ReqValidator(createReviewSchema),
  CreateReviewController
);

export default router;
