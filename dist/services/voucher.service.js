"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVoucherService = CreateVoucherService;
exports.CheckVoucherValidityService = CheckVoucherValidityService;
const prisma_1 = __importDefault(require("../lib/prisma"));
const zod_1 = require("zod");
function CreateVoucherService(param) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { event_id, voucher_code, discount_amount, voucher_start_date, voucher_end_date, max_usage, } = param;
            // --- Basic format and value validation ---
            if (!voucher_code ||
                voucher_code.trim() === "" ||
                voucher_code.length < 5) {
                throw new Error("Voucher code is required and must be at least 5 characters.");
            }
            if (discount_amount <= 0) {
                throw new Error("Discount amount must be greater than zero.");
            }
            if (max_usage <= 0) {
                throw new Error("Max usage must be greater than zero.");
            }
            // 3. If start and end are the same day, end time must be after start time
            const sameDay = voucher_start_date.toDateString() === voucher_end_date.toDateString();
            if (sameDay && voucher_end_date.getTime() <= voucher_start_date.getTime()) {
                throw new Error("If start and end are on the same day, end time must be after start time.");
            }
            // --- Check for duplicate voucher code for the same event ---
            const isExist = yield prisma_1.default.voucher.findFirst({
                where: {
                    event_id: event_id,
                    voucher_code: voucher_code,
                },
            });
            if (isExist) {
                throw new Error("Voucher code already exists.");
            }
            // --- Check event ---
            const event = yield prisma_1.default.event.findUnique({ where: { id: event_id } });
            if (!event) {
                throw new Error("Event not found.");
            }
            // Discount amount can't exceed event price
            if (discount_amount > event.price) {
                throw new Error("Voucher discount cannot be greater than the event price.");
            }
            // Voucher end date must not exceed event end date
            if (voucher_end_date > event.end_date) {
                throw new Error("Voucher end date cannot be after the event end date.");
            }
            // Max usage must not exceed total seats
            if (max_usage > event.total_seats) {
                throw new Error("Max usage cannot exceed the total number of event seats.");
            }
            // --- Create the voucher ---
            const voucher = yield prisma_1.default.voucher.create({
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
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                console.error("Validation failed:", err.errors);
                throw new Error("Validation failed");
            }
            console.error("Unexpected error:", err);
            throw err;
        }
    });
}
function CheckVoucherValidityService(event_id, voucher_code) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Find the voucher by code and event ID
            const voucher = yield prisma_1.default.voucher.findFirst({
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
            const event = yield prisma_1.default.event.findUnique({
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
        }
        catch (err) {
            throw err;
        }
    });
}
