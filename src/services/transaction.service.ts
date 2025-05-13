import prisma from "../lib/prisma";
import { transaction_status, Prisma } from "@prisma/client";
import {
  ICreateTransactionParam,
  IPaymentTransactionParam,
  IEOActionTransactionParam,
} from "../interfaces/transaction.interface";
import { cloudinaryRemove, cloudinaryUpload } from "../utils/cloudinary";
import { randomBytes } from "crypto";

import path from "path";
import fs from "fs";
import { transporter } from "../utils/nodemailer";
import handlebars from "handlebars";

//Create Transaction (Click "BuyTicket" Button from event details page)
async function CreateTransactionService(param: ICreateTransactionParam) {
  const {
    user_id,
    event_id,
    quantity,
    attend_date, // This is already a Date object
    payment_method,
    coupon_id,
    voucher_id,
    points_id,
  } = param;

  // Check that user doesn't try to use both voucher and coupon
  if (coupon_id && voucher_id) {
    throw new Error("You can only use either a voucher or a coupon, not both");
  }

  // 1. Fetch Event & User
  const [event, user] = await Promise.all([
    prisma.event.findUnique({ where: { id: event_id } }),
    prisma.user.findUnique({ where: { id: user_id } }),
  ]);
  if (!event) throw new Error("Event not found");
  if (!user) throw new Error("User not found");

  // 2. Check seat availability
  if (event.remaining_seats < quantity) {
    throw new Error("Not enough seats available");
  }

  // 3. Validate attend date is within event dates
  const eventStartDate = new Date(event.start_date);
  const eventEndDate = new Date(event.end_date);

  if (attend_date < eventStartDate || attend_date > eventEndDate) {
    throw new Error("Attend date must be within event start and end dates");
  }

  const now = new Date();

  // 3. Gather discounts
  let couponDiscount = 0;
  let voucherDiscount = 0;
  let pointsDiscount = 0;

  // 3a. Coupon
  if (coupon_id) {
    const coupon = await prisma.coupon.findUnique({ where: { id: coupon_id } });
    if (
      !coupon ||
      coupon.user_id !== user_id ||
      now < coupon.coupon_start_date ||
      now > coupon.coupon_end_date ||
      coupon.use_count >= coupon.max_usage
    ) {
      throw new Error("Invalid or expired coupon");
    }
    couponDiscount = coupon.discount_amount;
  }

  // 3b. Voucher
  if (voucher_id) {
    const voucher = await prisma.voucher.findUnique({
      where: { id: voucher_id },
    });
    if (
      !voucher ||
      voucher.event_id !== event_id ||
      now < voucher.voucher_start_date ||
      now > voucher.voucher_end_date ||
      voucher.usage_amount >= voucher.max_usage
    ) {
      throw new Error("Invalid or expired voucher");
    }
    voucherDiscount = voucher.discount_amount;
  }

  // 3c. Points
  if (points_id) {
    const points = await prisma.points.findUnique({ where: { id: points_id } });
    if (
      !points ||
      points.user_id !== user_id ||
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
        user_id,
        event_id,
        quantity,
        unit_price: event.price,
        total_pay_amount: finalAmount,
        payment_proof: null,
        status,
        expires_at: expiresAt,
        coupon_id: coupon_id ?? undefined,
        voucher_id: voucher_id ?? undefined,
        points_id: points_id ?? undefined,
        attend_date: attend_date,
        payment_method: payment_method,
      },
    });

    // 6b. Decrement seats
    await tx.event.update({
      where: { id: event_id },
      data: { remaining_seats: event.remaining_seats - quantity },
    });

    // 6c. Increment coupon usage
    if (coupon_id) {
      await tx.coupon.update({
        where: { id: coupon_id },
        data: { use_count: { increment: 1 } },
      });
    }

    // 6d. Increment voucher usage
    if (voucher_id) {
      await tx.voucher.update({
        where: { id: voucher_id },
        data: { usage_amount: { increment: 1 } },
      });
    }

    // 6e. Mark points used
    if (points_id) {
      await tx.points.update({
        where: { id: points_id },
        data: {
          is_used: true,
        },
      });
    }

    return transaction;
  });

  return tx;
}

//Customer upload Payment Proof, and then change the status to "waiting_for_admin_confirmation"
async function PaymentTransactionService({
  id,
  user_id,
  file,
}: IPaymentTransactionParam) {
  let url = "";
  try {
    // 1. Get the transaction
    const tx = await prisma.transaction.findUnique({
      where: { id: id },
    });

    if (!tx) {
      throw new Error("Transaction not found");
    }

    // 2. Check ownership
    if (tx.user_id !== user_id) {
      throw new Error("You are not authorized to confirm this transaction");
    }

    // 3. Must be in the correct status
    if (tx.status !== transaction_status.waiting_for_payment) {
      throw new Error("Transaction is not awaiting payment");
    }

    // 4. Check if expired
    if (tx.expires_at && tx.expires_at < new Date()) {
      await prisma.transaction.update({
        where: { id: id },
        data: { status: transaction_status.expired },
      });

      throw new Error("Transaction has expired");
    }

    // 5. Upload to Cloudinary
    const { secure_url } = await cloudinaryUpload(file);
    url = secure_url;
    const splitUrl = secure_url.split("/");
    const fileName = splitUrl[splitUrl.length - 1];

    // 6. Wrap database update inside $transaction
    const updatedTx = await prisma.$transaction(async (txClient) => {
      // Update transaction with payment proof and status inside the transaction
      const updatedTransaction = await txClient.transaction.update({
        where: { id: id },
        data: {
          payment_proof: fileName, // Save the secure URL in the database
          status: transaction_status.waiting_for_admin_confirmation,
          updated_at: new Date(),
        },
      });

      return updatedTransaction;
    });

    return updatedTx;
  } catch (err) {
    if (url) await cloudinaryRemove(url);
    throw err;
  }
}

//Event Organizer Action Confirm or Reject
async function EOActionTransactionService(param: IEOActionTransactionParam) {
  try {
    const { id, user_id, action } = param;

    // Fetch the transaction along with its event to ensure the EO is authorized to act
    const transaction = await prisma.transaction.findUnique({
      where: { id: id },
      include: {
        event: true,
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) throw new Error("Transaction not found");

    const event = transaction.event;

    // Ensure the transaction belongs to the correct event organizer
    if (event.organizer_id !== user_id) {
      throw new Error("You are not authorized to modify this transaction");
    }

    // Check the current status of the transaction
    if (
      transaction.status !== transaction_status.waiting_for_admin_confirmation
    ) {
      throw new Error(
        "Transaction status is not waiting for admin confirmation"
      );
    }

    // Use the action from the enum directly
    let updatedStatus: transaction_status;
    if (
      action === transaction_status.confirmed ||
      action === transaction_status.rejected
    ) {
      updatedStatus = action; // Directly using the action from the enum
    } else {
      throw new Error("Invalid action");
    }

    // If rejecting, perform rollback in a transaction
    if (updatedStatus === transaction_status.rejected) {
      return await prisma.$transaction(async (txClient) => {
        // a) Restore seats
        await txClient.event.update({
          where: { id: transaction.event_id },
          data: { remaining_seats: { increment: transaction.quantity } },
        });

        // b) Refund coupon usage
        if (transaction.coupon_id) {
          await txClient.coupon.update({
            where: { id: transaction.coupon_id },
            data: { use_count: { decrement: 1 } },
          });
        }

        // c) Refund voucher usage
        if (transaction.voucher_id) {
          await txClient.voucher.update({
            where: { id: transaction.voucher_id },
            data: { usage_amount: { decrement: 1 } },
          });
        }

        // d) Mark points unused
        if (transaction.points_id) {
          await txClient.points.update({
            where: { id: transaction.points_id },
            data: { is_used: false },
          });
        }

        // e) Update the transaction status
        const updatedTransaction = await txClient.transaction.update({
          where: { id: id },
          data: {
            status: updatedStatus,
            updated_at: new Date(),
          },
        });

        // Send rejection email using template literals instead of Handlebars
        const htmlContent = `
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Transaction Rejected</title>
          </head>
          <body>
            <div
              style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"
            >
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #e53e3e;">Transaction Rejected</h2>
              </div>

              <div
                style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin-bottom: 20px;"
              >
                <p>Hi ${transaction.user.username},</p>
                <p>We regret to inform you that your transaction for
                  <strong>${transaction.event.name}</strong>
                  has been rejected by the event organizer.</p>

                <div
                  style="background-color: #fff; border-left: 4px solid #e53e3e; padding: 15px; margin: 15px 0;"
                >
                  <p style="margin: 0;"><strong>Transaction ID:</strong>
                    ${transaction.id}</p>
                  <p style="margin: 8px 0 0;"><strong>Rejection Reason:</strong>
                    Your transaction has been rejected</p>
                </div>

                <p>Any points, vouchers, or coupons used for this transaction have been
                  returned to your account. The seats you reserved have also been made
                  available again.</p>
              </div>

              <div style="margin: 24px 0; text-align: center;">
                <a
                  href="https://yourdomain.com/my-transactions"
                  style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;"
                >
                  View My Transactions
                </a>
              </div>

              <div
                style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666;"
              >
                <p>If you have any questions about this rejection, please contact the
                  event organizer directly or reply to this email for assistance.</p>
                <p>Thank you for using our platform.</p>
                <p>Best regards,<br /><strong>Ticket Team</strong></p>
              </div>
            </div>
          </body>
        </html>`;

        await transporter.sendMail({
          from: '"Ticket Admin" <no-reply@yourdomain.com>',
          to: transaction.user.email,
          subject: "Transaction Rejected",
          html: htmlContent,
        });

        return updatedTransaction;
      });
    } else {
      // For confirmation, update status and generate tickets
      return await prisma.$transaction(
        async (txClient) => {
          // Update the transaction status
          const updatedTransaction = await txClient.transaction.update({
            where: { id: id },
            data: {
              status: updatedStatus,
              updated_at: new Date(),
            },
          });

          // Generate tickets for the confirmed transaction
          const tickets = [];
          for (let i = 0; i < transaction.quantity; i++) {
            // Generate random ticket code
            const ticketCode = randomBytes(8).toString("hex").toUpperCase();

            const ticket = await txClient.ticket.create({
              data: {
                ticket_code: ticketCode,
                event_id: transaction.event_id,
                user_id: transaction.user_id,
                transaction_id: id,
              },
            });

            tickets.push(ticket);
          }

          // Send confirmation email using template literals instead of Handlebars
          const htmlContent = `
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Transaction Confirmed</title>
            </head>
            <body>
              <div
                style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"
              >
                <div style="text-align: center; margin-bottom: 20px;">
                  <h2 style="color: #10b981;">Transaction Confirmed</h2>
                </div>

                <div
                  style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin-bottom: 20px;"
                >
                  <p>Hi ${transaction.user.username},</p>
                  <p>Great news! Your transaction for
                    <strong>${transaction.event.name}</strong>
                    has been confirmed by the event organizer.</p>

                  <div
                    style="background-color: #fff; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0;"
                  >
                    <p style="margin: 0;"><strong>Transaction ID:</strong>
                      ${transaction.id}</p>
                    <p style="margin: 8px 0 0;"><strong>Event Date:</strong>
                      ${new Date(
                        transaction.event.start_date
                      ).toLocaleDateString()}</p>
                    <p style="margin: 8px 0 0;"><strong>Quantity:</strong>
                      ${transaction.quantity} ticket(s)</p>
                  </div>

                  <p>You're all set! Your tickets are now confirmed and ready for the event.</p>
                </div>

                <div style="margin: 24px 0; text-align: center;">
                  <a
                    href="https://yourdomain.com/my-tickets"
                    style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;"
                  >
                    View My Tickets
                  </a>
                </div>

                <div
                  style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666;"
                >
                  <p>We look forward to seeing you at the event!</p>
                  <p>If you have any questions, please contact the event organizer or reply to this email.</p>
                  <p>Best regards,<br /><strong>Ticket Team</strong></p>
                </div>
              </div>
            </body>
          </html>`;

          await transporter.sendMail({
            from: '"Ticket Admin" <no-reply@yourdomain.com>',
            to: transaction.user.email,
            subject: "Transaction Confirmed",
            html: htmlContent,
          });

          return { ...updatedTransaction, tickets };
        },
        {
          timeout: 10000, // Increase timeout to 10 seconds
          maxWait: 5000, // Maximum time to wait for transaction to start
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, // Less strict isolation level
        }
      );
    }
  } catch (err) {
    throw err;
  }
}

// Expire Transactions that have not received payment proof within 2 hours
async function AutoExpireTransactionService() {
  try {
    console.log("function auto expire berjalan");
    await prisma.transaction.updateMany({
      where: {
        status: transaction_status.waiting_for_payment,
        expires_at: { lt: new Date() },
      },
      data: {
        status: transaction_status.expired,
      },
    });
  } catch (err) {
    throw err;
  }
}

async function AutoCancelTransactionService() {
  try {
    console.log("function auto cancel berjalan");

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // 1. Find all transactions still pending admin confirmation for 3+ days
    const staleTransactions = await prisma.transaction.findMany({
      where: {
        status: transaction_status.waiting_for_admin_confirmation,
        updated_at: { lt: threeDaysAgo },
      },
    });

    // Rollback all transactions
    for (const tx of staleTransactions) {
      await prisma.$transaction(async (txClient) => {
        // a) Restore seats
        await txClient.event.update({
          where: { id: tx.event_id },
          data: { remaining_seats: { increment: tx.quantity } },
        });

        // b) Refund coupon usage
        if (tx.coupon_id) {
          await txClient.coupon.update({
            where: { id: tx.coupon_id },
            data: { use_count: { decrement: 1 } },
          });
        }

        // c) Refund voucher usage
        if (tx.voucher_id) {
          await txClient.voucher.update({
            where: { id: tx.voucher_id },
            data: { usage_amount: { decrement: 1 } },
          });
        }

        // d) Mark points unused
        if (tx.points_id) {
          await txClient.points.update({
            where: { id: tx.points_id },
            data: { is_used: false },
          });
        }

        // e) Finally cancel the transaction
        await txClient.transaction.update({
          where: { id: tx.id },
          data: { status: transaction_status.canceled, updated_at: new Date() },
        });
      });
    }
  } catch (err) {
    throw err;
  }
}

async function GetUserTicketsService(userId: string) {
  try {
    // Get all tickets belonging to the user with transaction and event details
    const tickets = await prisma.ticket.findMany({
      where: {
        user_id: userId,
        transaction: {
          status: transaction_status.confirmed,
        },
      },
      include: {
        event: {
          select: {
            name: true,
            start_date: true,
            end_date: true,
            location: true,
            event_image: true,
          },
        },
        transaction: {
          select: {
            created_at: true,
            quantity: true,
            total_pay_amount: true,
          },
        },
      },
      orderBy: {
        event: {
          start_date: "asc",
        },
      },
    });

    return tickets;
  } catch (err) {
    throw err;
  }
}

async function GetTransactionByIdService(
  transactionId: string,
  userId: string
) {
  try {
    // Find the transaction with the given ID
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            location: true,
            start_date: true,
            end_date: true,
            event_image: true,
            organizer_id: true,
            organizer: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        tickets: true,
      },
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Check if the user is authorized to view this transaction
    // Either the user owns the transaction or is the event organizer
    if (
      transaction.user_id !== userId &&
      transaction.event.organizer_id !== userId
    ) {
      throw new Error("You are not authorized to view this transaction");
    }

    return transaction;
  } catch (err) {
    throw err;
  }
}

export {
  CreateTransactionService,
  PaymentTransactionService,
  EOActionTransactionService,
  AutoExpireTransactionService,
  AutoCancelTransactionService,
  GetUserTicketsService,
  GetTransactionByIdService,
};
