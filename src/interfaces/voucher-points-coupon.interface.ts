export interface ICreatePointsParam {
  userId: number;
  pointsAmount: number;
  creditedAt: Date;
  expiresAt: Date;
  isUsed: boolean;
  isExpired: boolean;
}

export interface ICreateCouponParam {
  userId: number;
  couponCode: string;
  discountAmount: number;
  couponStartDate: Date;
  couponEndDate: Date;
  maxUsage: number;
  useCount: number;
}
