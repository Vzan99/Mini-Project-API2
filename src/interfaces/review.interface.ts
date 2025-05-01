export interface ICreateReviewParam {
  userId: number;
  eventId: number;
  rating: number; // e.g. 1–5
  review: string;
}
