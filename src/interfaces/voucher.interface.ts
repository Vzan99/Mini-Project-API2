export interface ICreateVoucher {
  event_id: string;
  voucher_code: string;
  discount_amount: number;
  voucher_start_date: Date;
  voucher_end_date: Date;
  max_usage: number;
}
