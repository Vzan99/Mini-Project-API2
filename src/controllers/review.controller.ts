import { Request, Response, NextFunction } from "express";
import { CreateReviewService } from "../services/review.service";

async function CreateReviewController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId, eventId, rating, review } = req.body;
    const data = await CreateReviewService({ userId, eventId, rating, review });
    res.status(201).json({ message: "Review created", data });
  } catch (err) {
    next(err);
  }
}

export { CreateReviewController };
