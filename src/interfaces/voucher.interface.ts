export interface ICreateVoucher {
  eventId: string;
  voucherCode: string;
  discountAmount: number;
  voucherStartDate: Date;
  voucherEndDate: Date;
  maxUsage: number;
}
