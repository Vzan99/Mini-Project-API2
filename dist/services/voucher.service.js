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
const prisma_1 = __importDefault(require("../lib/prisma"));
function CreateVoucherService(param) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { eventId, voucherCode, discountAmount, voucherStartDate, voucherEndDate, maxUsage, } = param;
            // Validation
            if (!voucherCode || voucherCode.trim() === "" || voucherCode.length < 5) {
                throw new Error("Voucher code is required and must be at least 5 characters.");
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
            // Allow voucher start date to be up to 2 days in the past
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            if (new Date(voucherStartDate) < twoDaysAgo) {
                throw new Error("Voucher start date cannot be more than 2 days in the past.");
            }
            // Check if the voucher code already exists for the event
            const isExist = yield prisma_1.default.voucher.findFirst({
                where: {
                    event_id: eventId,
                    voucher_code: voucherCode,
                },
            });
            if (isExist) {
                throw new Error("Voucher code already exists.");
            }
            // Fetch the event to ensure it exists
            const event = yield prisma_1.default.event.findUnique({
                where: { id: eventId },
            });
            if (!event) {
                throw new Error("Event not found.");
            }
            // Check if the voucher discount is greater than the event price
            if (discountAmount > event.price) {
                throw new Error("Voucher discount cannot be greater than the event price.");
            }
            // Check if voucher end date is after event end date
            if (voucherEndDate > event.end_date) {
                throw new Error("Voucher end date cannot be after the event end date.");
            }
            // Check if max usage exceeds total event seats
            if (maxUsage > event.total_seats) {
                throw new Error("Max usage cannot exceed the total number of event seats.");
            }
            // Check if the voucher is already expired
            if (new Date() > voucherEndDate) {
                throw new Error("Voucher has expired.");
            }
            // Create the voucher
            const voucher = yield prisma_1.default.voucher.create({
                data: {
                    event_id: eventId,
                    voucher_code: voucherCode,
                    discount_amount: discountAmount,
                    voucher_start_date: voucherStartDate,
                    voucher_end_date: voucherEndDate,
                    max_usage: maxUsage,
                    usage_amount: 0, // Initially no usage
                },
            });
            return voucher;
        }
        catch (err) {
            throw err;
        }
    });
}
