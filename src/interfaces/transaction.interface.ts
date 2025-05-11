import { transaction_status } from "@prisma/client";

export interface ICreateTransactionParam {
  user_id: string; // The ID of the customer making the purchase
  event_id: string; // The ID of the event for which they want to buy a ticket
  quantity: number; // The number of tickets the customer wants to buy
  attend_date: Date; // The date the customer plans to attend the event (as Date object)
  payment_method: string; // The payment method (creditCard, bankTransfer, eWallet)
  coupon_id?: string; // Optional: Coupon ID for applying discounts
  voucher_id?: string; // Optional: Voucher ID for applying discounts
  points_id?: string; // Optional: Points ID for applying discounts
}

export interface IPaymentTransactionParam {
  id: string;
  user_id: string;
  file: Express.Multer.File;
}

export interface IEOActionTransactionParam {
  id: string;
  user_id: string;
  action: transaction_status;
}
