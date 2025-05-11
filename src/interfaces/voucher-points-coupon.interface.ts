export interface ICreatePointsParam {
  user_id: string;
  points_amount: number;
  credited_at: Date;
  expires_at: Date;
  is_used: boolean;
  is_expired: boolean;
}

export interface ICreateCouponParam {
  user_id: string;
  coupon_code: string;
  discount_amount: number;
  coupon_start_date: Date;
  coupon_end_date: Date;
  max_usage: number;
  use_count: number;
}
