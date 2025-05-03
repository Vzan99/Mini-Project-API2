export interface ICreateReviewParam {
  userId: string;
  eventId: string;
  rating: number; // e.g. 1–5
  review: string;
}
