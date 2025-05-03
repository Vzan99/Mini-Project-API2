export interface ICreatePointsParam {
  userId: string;
  pointsAmount: number;
  creditedAt: Date;
  expiresAt: Date;
  isUsed: boolean;
  isExpired: boolean;
}

export interface ICreateCouponParam {
  userId: string;
  couponCode: string;
  discountAmount: number;
  couponStartDate: Date;
  couponEndDate: Date;
  maxUsage: number;
  useCount: number;
}
