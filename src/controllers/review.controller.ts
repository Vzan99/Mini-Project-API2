import { Request, Response, NextFunction } from "express";
import { CreateReviewService } from "../services/review.service";

async function CreateReviewController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get user_id from the authenticated token instead of request body
    const user_id = req.user.id;
    const { event_id, rating, review } = req.body;

    const data = await CreateReviewService({
      user_id,
      event_id,
      rating,
      review,
    });

    res.status(201).json({ message: "Review created", data });
  } catch (err) {
    next(err);
  }
}

export { CreateReviewController };
