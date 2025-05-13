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
exports.CreateReviewService = CreateReviewService;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
function CreateReviewService(_a) {
    return __awaiter(this, arguments, void 0, function* ({ user_id, event_id, rating, review, }) {
        try {
            // 1. Ensure event exists and has ended
            const event = yield prisma_1.default.event.findUnique({ where: { id: event_id } });
            if (!event)
                throw new Error("Event not found");
            if (event.end_date > new Date())
                throw new Error("Event has not ended yet");
            // 2. Ensure user had a confirmed transaction
            const tx = yield prisma_1.default.transaction.findFirst({
                where: {
                    user_id: user_id,
                    event_id: event_id,
                    status: client_1.transaction_status.confirmed,
                },
            });
            if (!tx)
                throw new Error("You can only review events you attended");
            // 3. Prevent duplicate reviews
            const existing = yield prisma_1.default.review.findFirst({
                where: { user_id: user_id, event_id: event_id },
            });
            if (existing)
                throw new Error("You have already reviewed this event");
            // 4. Create review
            const userReview = yield prisma_1.default.review.create({
                data: {
                    user_id: user_id,
                    event_id: event_id,
                    rating,
                    review,
                    created_at: new Date(),
                },
            });
            return userReview;
        }
        catch (err) {
            throw err;
        }
    });
}
