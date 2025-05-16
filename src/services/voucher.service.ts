import prisma from "../lib/prisma";
import { ICreateVoucher } from "../interfaces/voucher.interface";
import { ZodError } from "zod";

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

    // --- Basic format and value validation ---
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

    // --- Time-based validation ---
    const now = new Date();

    // 1. Start date must be today at or after 00:00 local time
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    if (voucher_start_date < todayMidnight) {
      throw new Error("Voucher start time must be today at 00:00 or later.");
    }

    // 2. End date must not be in the past
    if (voucher_end_date < now) {
      throw new Error("Voucher end date cannot be in the past.");
    }

    // 3. If start and end are the same day, end time must be after start time
    const sameDay =
      voucher_start_date.toDateString() === voucher_end_date.toDateString();
    if (sameDay && voucher_end_date.getTime() <= voucher_start_date.getTime()) {
      throw new Error(
        "If start and end are on the same day, end time must be after start time."
      );
    }

    // --- Check for duplicate voucher code for the same event ---
    const isExist = await prisma.voucher.findFirst({
      where: {
        event_id: event_id,
        voucher_code: voucher_code,
      },
    });

    if (isExist) {
      throw new Error("Voucher code already exists.");
    }

    // --- Check event ---
    const event = await prisma.event.findUnique({ where: { id: event_id } });
    if (!event) {
      throw new Error("Event not found.");
    }

    // Discount amount can't exceed event price
    if (discount_amount > event.price) {
      throw new Error(
        "Voucher discount cannot be greater than the event price."
      );
    }

    // Voucher end date must not exceed event end date
    if (voucher_end_date > event.end_date) {
      throw new Error("Voucher end date cannot be after the event end date.");
    }

    // Max usage must not exceed total seats
    if (max_usage > event.total_seats) {
      throw new Error(
        "Max usage cannot exceed the total number of event seats."
      );
    }

    // Redundant after above, but left in case of timing conflict
    if (now > voucher_end_date) {
      throw new Error("Voucher has already expired.");
    }

    // --- Create the voucher ---
    const voucher = await prisma.voucher.create({
      data: {
        event_id,
        voucher_code,
        discount_amount,
        voucher_start_date,
        voucher_end_date,
        max_usage,
        usage_amount: 0,
      },
    });

    return voucher;
  } catch (err) {
    if (err instanceof ZodError) {
      console.error("Validation failed:", err.errors);
      throw new Error("Validation failed");
    }

    console.error("Unexpected error:", err);
    throw err;
  }
}

async function CheckVoucherValidityService(
  event_id: string,
  voucher_code: string
) {
  try {
    // Find the voucher by code and event ID
    const voucher = await prisma.voucher.findFirst({
      where: {
        event_id: event_id,
        voucher_code: voucher_code,
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
      where: { id: event_id },
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
