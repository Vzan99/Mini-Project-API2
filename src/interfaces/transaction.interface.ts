import { transaction_status } from "@prisma/client";

export interface ICreateTransactionParam {
  userId: string; // The ID of the customer making the purchase
  eventId: string; // The ID of the event for which they want to buy a ticket
  quantity: number; // The number of tickets the customer wants to buy
  attendDate: Date; // The date the customer plans to attend the event (as Date object)
  paymentMethod: string; // The payment method (creditCard, bankTransfer, eWallet)
  couponId?: string; // Optional: Coupon ID for applying discounts
  voucherId?: string; // Optional: Voucher ID for applying discounts
  pointsId?: string; // Optional: Points ID for applying discounts
}

export interface IPaymentTransactionParam {
  transactionId: string;
  userId: string;
  file: Express.Multer.File;
}

export interface IEOActionTransactionParam {
  transactionId: string;
  userId: string;
  action: transaction_status;
}
