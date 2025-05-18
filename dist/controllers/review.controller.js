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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReviewController = CreateReviewController;
const review_service_1 = require("../services/review.service");
function CreateReviewController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user_id = req.user.id;
            const { event_id, rating, review } = req.body;
            const data = yield (0, review_service_1.CreateReviewService)({
                user_id,
                event_id,
                rating,
                review,
            });
            res.status(201).json({ message: "Review created", data });
        }
        catch (err) {
            next(err);
        }
    });
}
