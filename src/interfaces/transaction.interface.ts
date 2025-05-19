import { transaction_status } from "@prisma/client";

export interface ICreateTransactionParam {
  user_id: string;
  event_id: string;
  quantity: number;
  attend_date: Date;
  payment_method: string;
  coupon_id?: string;
  voucher_id?: string;
  points_used?: number;
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
