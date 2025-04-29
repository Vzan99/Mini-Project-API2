export interface ICreateVoucher {
  eventId: number;
  voucherCode: string;
  discountAmount: number;
  voucherStartDate: Date;
  voucherEndDate: Date;
  maxUsage: number;
}
