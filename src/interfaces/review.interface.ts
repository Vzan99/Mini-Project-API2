export interface ICreateReviewParam {
  user_id: string;
  event_id: string;
  rating: number; // e.g. 1–5
  review: string;
}
