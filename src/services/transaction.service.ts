// src/services/TransactionService.ts

import { PrismaClient, transaction_status } from "@prisma/client";
import { ICreateTransactionParam } from "../interfaces/transaction.interface";

const prisma = new PrismaClient();

async function CreateTransactionService(param: ICreateTransactionParam) {
  const { userId, eventId, quantity, couponId, voucherId, pointsId } = param;

  // 1. Fetch Event & User
  const [event, user] = await Promise.all([
    prisma.event.findUnique({ where: { id: eventId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);
  if (!event) throw new Error("Event not found");
  if (!user) throw new Error("User not found");

  // 2. Check seat availability
  if (event.remaining_seats < quantity) {
    throw new Error("Not enough seats available");
  }

  const now = new Date();

  // 3. Gather discounts
  let couponDiscount = 0;
  let voucherDiscount = 0;
  let pointsDiscount = 0;

  // 3a. Coupon
  if (couponId) {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (
      !coupon ||
      coupon.user_id !== userId ||
      now < coupon.coupon_start_date ||
      now > coupon.coupon_end_date ||
      coupon.use_count >= coupon.max_usage
    ) {
      throw new Error("Invalid or expired coupon");
    }
    couponDiscount = coupon.discount_amount;
  }

  // 3b. Voucher
  if (voucherId) {
    const voucher = await prisma.voucher.findUnique({
      where: { id: voucherId },
    });
    if (
      !voucher ||
      voucher.event_id !== eventId ||
      now < voucher.voucher_start_date ||
      now > voucher.voucher_end_date ||
      voucher.usage_amount >= voucher.max_usage
    ) {
      throw new Error("Invalid or expired voucher");
    }
    voucherDiscount = voucher.discount_amount;
  }

  // 3c. Points
  if (pointsId) {
    const points = await prisma.points.findUnique({ where: { id: pointsId } });
    if (
      !points ||
      points.user_id !== userId ||
      points.is_used ||
      points.is_expired ||
      now > points.expires_at
    ) {
      throw new Error("Invalid or expired points");
    }
    pointsDiscount = points.points_amount;
  }

  // 4. Calculate payment
  const originalAmount = event.price * quantity;
  const totalDiscount = couponDiscount + voucherDiscount + pointsDiscount;
  const finalAmount = Math.max(0, originalAmount - totalDiscount);

  // 5. Determine initial status & expiration
  let status: transaction_status;
  let expiresAt: Date;
  if (event.price === 0) {
    status = transaction_status.confirmed;
    expiresAt = now; // immediate
  } else {
    status = transaction_status.waiting_for_payment;
    expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
  }

  // 6. Create transaction + side effects in one atomic call
  const tx = await prisma.$transaction(async (tx) => {
    // 6a. Create transaction
    const transaction = await tx.transaction.create({
      data: {
        user_id: userId,
        event_id: eventId,
        quantity,
        unit_price: event.price,
        total_pay_amount: finalAmount,
        payment_proof: null,
        status,
        expires_at: expiresAt,
        coupon_id: couponId ?? undefined,
        voucher_id: voucherId ?? undefined,
        points_id: pointsId ?? undefined,
      },
    });

    // 6b. Decrement seats
    await tx.event.update({
      where: { id: eventId },
      data: { remaining_seats: event.remaining_seats - quantity },
    });

    // 6c. Increment coupon usage
    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { use_count: { increment: 1 } },
      });
    }

    // 6d. Increment voucher usage
    if (voucherId) {
      await tx.voucher.update({
        where: { id: voucherId },
        data: { usage_amount: { increment: 1 } },
      });
    }

    // 6e. Mark points used
    if (pointsId) {
      await tx.points.update({
        where: { id: pointsId },
        data: {
          is_used: true,
        },
      });
    }

    return transaction;
  });

  return tx;
}

//Cancelling Transaction
async function CancelTransactionService(txId: number) {
  const t = await prisma.transaction.findUnique({ where: { id: txId } });
  if (!t) throw new Error("Not found");
  await prisma.$transaction(async (tx) => {
    // restore seats
    await tx.event.update({
      where: { id: t.event_id },
      data: { remaining_seats: { increment: t.quantity } },
    });
    // return coupon
    if (t.coupon_id) {
      await tx.coupon.update({
        where: { id: t.coupon_id },
        data: { use_count: { decrement: 1 } },
      });
    }
    // return voucher
    if (t.voucher_id) {
      await tx.voucher.update({
        where: { id: t.voucher_id },
        data: { usage_amount: { decrement: 1 } },
      });
    }
    // return points
    if (t.points_id) {
      await tx.points.update({
        where: { id: t.points_id },
        data: { is_used: false },
      });
    }
    // mark canceled
    await tx.transaction.update({
      where: { id: txId },
      data: { status: transaction_status.canceled },
    });
  });
}

//Confirm Transaction
async function ConfirmTransactionService(
  transactionId: number,
  paymentProofUrl: string
) {
  // 1. Fetch the transaction
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });
  if (!tx) {
    throw new Error("Transaction not found");
  }

  // 2. Must be waiting_for_payment
  if (tx.status !== transaction_status.waiting_for_payment) {
    throw new Error("Transaction not awaiting payment");
  }

  // 3. Must not be expired
  if (tx.expires_at < new Date()) {
    // Optionally auto-expire here or let your cron job handle it
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: transaction_status.expired },
    });
    throw new Error("Transaction has already expired");
  }

  // 4. Update with payment proof and new status
  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      payment_proof: paymentProofUrl,
      status: transaction_status.waiting_for_admin_confirmation,
      updated_at: new Date(),
    },
  });

  return updated;
}

export {
  CreateTransactionService,
  CancelTransactionService,
  ConfirmTransactionService,
};
