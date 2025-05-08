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
exports.GetOrganizerProfileService = GetOrganizerProfileService;
exports.GetCardSectionsService = GetCardSectionsService;
exports.GetUniqueLocationsService = GetUniqueLocationsService;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
function GetOrganizerProfileService(organizerId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Ensure the user is actually an event_organizer and get their profile data
            const user = yield prisma_1.default.user.findUnique({
                where: { id: organizerId },
                select: {
                    role: true,
                    username: true,
                    first_name: true,
                    last_name: true,
                    profile_picture: true,
                },
            });
            if (!user || user.role !== "event_organizer") {
                throw new Error("User is not an event organizer");
            }
            // Fetch all events created by this organizer with more details
            const events = yield prisma_1.default.event.findMany({
                where: { organizer_id: organizerId },
                include: {
                    review: {
                        include: {
                            user: { select: { username: true } }, // reviewer name
                        },
                    },
                },
            });
            // Flatten all reviews
            const allReviews = events.flatMap((event) => event.review);
            const averageRating = allReviews.length > 0
                ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
                : 0;
            return {
                organizer: {
                    id: organizerId,
                    username: user.username,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    profilePicture: user.profile_picture,
                },
                averageRating,
                totalReviews: allReviews.length,
                reviews: allReviews,
                events: events.map((e) => ({
                    id: e.id,
                    name: e.name,
                    startDate: e.start_date,
                    endDate: e.end_date,
                    location: e.location,
                    price: e.price,
                    totalSeats: e.total_seats,
                    remainingSeats: e.remaining_seats,
                    category: e.category,
                    eventImage: e.event_image,
                    totalReviews: e.review.length,
                })),
            };
        }
        catch (err) {
            throw err;
        }
    });
}
function GetCardSectionsService(categoryFilter) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const now = new Date();
            const categoriesToFetch = categoryFilter
                ? [categoryFilter]
                : Object.values(client_1.category);
            const sections = yield Promise.all(categoriesToFetch.map((categoryValue) => __awaiter(this, void 0, void 0, function* () {
                const events = yield prisma_1.default.event.findMany({
                    where: {
                        category: categoryValue,
                        start_date: { gt: now },
                    },
                    orderBy: { start_date: "asc" },
                    take: 3,
                    select: {
                        id: true,
                        name: true,
                        event_image: true,
                        location: true,
                        start_date: true,
                        end_date: true,
                    },
                });
                return { category: categoryValue, events };
            })));
            return sections;
        }
        catch (err) {
            throw err;
        }
    });
}
function GetUniqueLocationsService() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get all unique locations from events
            const locations = yield prisma_1.default.event.findMany({
                select: {
                    location: true,
                },
                distinct: ["location"],
                orderBy: {
                    location: "asc",
                },
            });
            // Extract just the location strings
            return locations.map((item) => item.location);
        }
        catch (err) {
            throw err;
        }
    });
}
