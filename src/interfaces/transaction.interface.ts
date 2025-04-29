export interface ICreateTransactionParam {
  userId: number; // The ID of the customer making the purchase
  eventId: number; // The ID of the event for which they want to buy a ticket
  quantity: number; // The number of tickets the customer wants to buy
  couponId?: number; // Optional: Coupon ID for applying discounts
  voucherId?: number; // Optional: Voucher ID for applying discounts
  pointsId?: number; // Optional: Points ID for applying discounts
}
