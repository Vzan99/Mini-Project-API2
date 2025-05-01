import prisma from "../lib/prisma";
import { ICreateVoucher } from "../interfaces/voucher.interface";

async function CreateVoucherService(param: ICreateVoucher) {
  try {
    const {
      eventId,
      voucherCode,
      discountAmount,
      voucherStartDate,
      voucherEndDate,
      maxUsage,
    } = param;

    //Validation
    if (!voucherCode || voucherCode.trim() === "") {
      throw new Error("Voucher code is required.");
    }

    if (discountAmount <= 0) {
      throw new Error("Discount amount must be greater than zero.");
    }

    if (maxUsage <= 0) {
      throw new Error("Max usage must be greater than zero.");
    }

    if (voucherEndDate <= voucherStartDate) {
      throw new Error("Voucher end date must be after start date.");
    }

    const isExist = await prisma.voucher.findFirst({
      where: {
        event_id: eventId,
        voucher_code: voucherCode,
      },
    });

    if (isExist) {
      throw new Error("Voucher code already exists.");
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error("Event not found.");
    }

    //Create Voucher
    const voucher = await prisma.voucher.create({
      data: {
        event_id: eventId,
        voucher_code: voucherCode,
        discount_amount: discountAmount,
        voucher_start_date: voucherStartDate,
        voucher_end_date: voucherEndDate,
        max_usage: maxUsage,
        usage_amount: 0,
      },
    });

    return voucher;
  } catch (err) {
    throw err;
  }
}

export { CreateVoucherService };

//tambah validasi untuk voucher tidak bisa dibuat jika tanggal event sudah selesai
