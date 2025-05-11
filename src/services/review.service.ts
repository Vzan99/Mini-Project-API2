import prisma from "../lib/prisma";
import { ICreateReviewParam } from "../interfaces/review.interface";
import { transaction_status } from "@prisma/client";

async function CreateReviewService({
  user_id,
  event_id,
  rating,
  review,
}: ICreateReviewParam) {
  try {
    // 1. Ensure event exists and has ended
    const event = await prisma.event.findUnique({ where: { id: event_id } });
    if (!event) throw new Error("Event not found");
    if (event.end_date > new Date()) throw new Error("Event has not ended yet");

    // 2. Ensure user had a confirmed transaction
    const tx = await prisma.transaction.findFirst({
      where: {
        user_id: user_id,
        event_id: event_id,
        status: transaction_status.confirmed,
      },
    });
    if (!tx) throw new Error("You can only review events you attended");

    // 3. Prevent duplicate reviews
    const existing = await prisma.review.findFirst({
      where: { user_id: user_id, event_id: event_id },
    });
    if (existing) throw new Error("You have already reviewed this event");

    // 4. Create review
    const userReview = await prisma.review.create({
      data: {
        user_id: user_id,
        event_id: event_id,
        rating,
        review,
        created_at: new Date(),
      },
    });

    return userReview;
  } catch (err) {
    throw err;
  }
}

export { CreateReviewService };
