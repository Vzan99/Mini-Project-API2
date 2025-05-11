import prisma from "../lib/prisma";
import { ICreateVoucher } from "../interfaces/voucher.interface";

async function CreateVoucherService(param: ICreateVoucher) {
  try {
    const {
      event_id,
      voucher_code,
      discount_amount,
      voucher_start_date,
      voucher_end_date,
      max_usage,
    } = param;

    // Validation
    if (
      !voucher_code ||
      voucher_code.trim() === "" ||
      voucher_code.length < 5
    ) {
      throw new Error(
        "Voucher code is required and must be at least 5 characters."
      );
    }

    if (discount_amount <= 0) {
      throw new Error("Discount amount must be greater than zero.");
    }

    if (max_usage <= 0) {
      throw new Error("Max usage must be greater than zero.");
    }

    if (voucher_end_date <= voucher_start_date) {
      throw new Error("Voucher end date must be after start date.");
    }

    // Allow voucher start date to be up to 2 days in the past
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    if (new Date(voucher_start_date) < twoDaysAgo) {
      throw new Error(
        "Voucher start date cannot be more than 2 days in the past."
      );
    }

    // Check if the voucher code already exists for the event
    const isExist = await prisma.voucher.findFirst({
      where: {
        event_id: event_id,
        voucher_code: voucher_code,
      },
    });

    if (isExist) {
      throw new Error("Voucher code already exists.");
    }

    // Fetch the event to ensure it exists
    const event = await prisma.event.findUnique({
      where: { id: event_id },
    });

    if (!event) {
      throw new Error("Event not found.");
    }

    // Check if the voucher discount is greater than the event price
    if (discount_amount > event.price) {
      throw new Error(
        "Voucher discount cannot be greater than the event price."
      );
    }

    // Check if voucher end date is after event end date
    if (voucher_end_date > event.end_date) {
      throw new Error("Voucher end date cannot be after the event end date.");
    }

    // Check if max usage exceeds total event seats
    if (max_usage > event.total_seats) {
      throw new Error(
        "Max usage cannot exceed the total number of event seats."
      );
    }

    // Check if the voucher is already expired
    if (new Date() > voucher_end_date) {
      throw new Error("Voucher has expired.");
    }

    // Create the voucher
    const voucher = await prisma.voucher.create({
      data: {
        event_id: event_id,
        voucher_code: voucher_code,
        discount_amount: discount_amount,
        voucher_start_date: voucher_start_date,
        voucher_end_date: voucher_end_date,
        max_usage: max_usage,
        usage_amount: 0, // Initially no usage
      },
    });

    return voucher;
  } catch (err) {
    throw err;
  }
}

async function CheckVoucherValidityService(
  eventId: string,
  voucherCode: string
) {
  try {
    // Find the voucher by code and event ID
    const voucher = await prisma.voucher.findFirst({
      where: {
        event_id: eventId,
        voucher_code: voucherCode,
      },
    });

    // If voucher doesn't exist
    if (!voucher) {
      return {
        is_valid: false,
        message: "Voucher not found",
      };
    }

    const now = new Date();

    // Check if voucher is within valid date range
    if (now < voucher.voucher_start_date) {
      return {
        is_valid: false,
        message: "Voucher is not yet active",
        active_from: voucher.voucher_start_date,
      };
    }

    if (now > voucher.voucher_end_date) {
      return {
        is_valid: false,
        message: "Voucher has expired",
        expiredAt: voucher.voucher_end_date,
      };
    }

    // Check if voucher has reached max usage
    if (voucher.usage_amount >= voucher.max_usage) {
      return {
        is_valid: false,
        message: "Voucher has reached maximum usage limit",
      };
    }

    // Fetch the event to ensure it exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return {
        is_valid: false,
        message: "Event not found",
      };
    }

    // Voucher is valid
    return {
      is_valid: true,
      message: "Voucher is valid",
      voucher_id: voucher.id,
      discount_amount: voucher.discount_amount,
      remaining_uses: voucher.max_usage - voucher.usage_amount,
    };
  } catch (err) {
    throw err;
  }
}

export { CreateVoucherService, CheckVoucherValidityService };
