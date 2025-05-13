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
exports.GetOrganizerEventsService = GetOrganizerEventsService;
exports.GetEventStatisticsService = GetEventStatisticsService;
exports.GetTransactionService = GetTransactionService;
exports.GetEventDetailsService = GetEventDetailsService;
exports.UpdateEventService = UpdateEventService;
exports.UpdateEventImageService = UpdateEventImageService;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const cloudinary_1 = require("../utils/cloudinary");
const dateFilter_1 = require("../helper/dateFilter");
const generateTimeSeriesData_1 = require("../helper/generateTimeSeriesData");
/**
 * Retrieves all events created by a specific organizer
 *
 * @param organizerId - The UUID of the event organizer
 * @returns Array of events with selected fields and transaction count
 */
function GetOrganizerEventsService(organizerId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const events = yield prisma_1.default.event.findMany({
                where: { organizer_id: organizerId },
                select: {
                    id: true,
                    name: true,
                    start_date: true,
                    end_date: true,
                    location: true,
                    price: true,
                    total_seats: true,
                    remaining_seats: true,
                    category: true,
                    event_image: true,
                    _count: {
                        select: {
                            transactions: true,
                        },
                    },
                },
                orderBy: {
                    created_at: "desc",
                },
            });
            return events;
        }
        catch (err) {
            throw err;
        }
    });
}
/**
 * Generates comprehensive statistics for an organizer's events
 *
 * @param organizerId - The UUID of the event organizer
 * @param timeFilter - Optional time range filter (day, week, month, year or specific date)
 * @returns Statistics object with totals and categorized data
 */
function GetEventStatisticsService(organizerId, timeFilter) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const dateFilter = yield (0, dateFilter_1.BuildDateFilter)(timeFilter);
            const whereClause = { organizer_id: organizerId };
            if (dateFilter) {
                whereClause.created_at = dateFilter;
            }
            const events = yield prisma_1.default.event.findMany({
                where: whereClause,
                include: {
                    transactions: {
                        where: {
                            status: client_1.transaction_status.confirmed,
                        },
                    },
                },
            });
            const total_events = events.length;
            let total_attendees = 0;
            let total_revenue = 0;
            const categoryMap = new Map();
            events.forEach((event) => {
                const category = event.category.toString();
                categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
                event.transactions.forEach((tx) => {
                    total_attendees += tx.quantity;
                    total_revenue += tx.total_pay_amount;
                });
            });
            const events_by_category = Array.from(categoryMap.entries()).map(([category, count]) => ({
                category,
                count,
            }));
            const recentTransactions = yield prisma_1.default.transaction.findMany({
                where: {
                    event: {
                        organizer_id: organizerId,
                    },
                    status: client_1.transaction_status.confirmed,
                },
                take: 5,
                orderBy: {
                    created_at: "desc",
                },
                include: {
                    event: {
                        select: {
                            name: true,
                        },
                    },
                    user: {
                        select: {
                            username: true,
                        },
                    },
                },
            });
            const recent_transactions = recentTransactions.map((tx) => ({
                id: tx.id,
                event_name: tx.event.name,
                customer_name: tx.user.username,
                amount: tx.total_pay_amount,
                status: tx.status,
                date: tx.created_at,
            }));
            // Generate time series data for charts - sekarang menggunakan helper function
            const time_series_data = yield (0, generateTimeSeriesData_1.generateTimeSeriesData)(organizerId, timeFilter);
            return {
                total_events,
                total_attendees,
                total_revenue,
                events_by_category,
                recent_transactions,
                time_series_data,
            };
        }
        catch (err) {
            throw err;
        }
    });
}
/**
 * Retrieves all transactions for events organized by a specific organizer
 *
 * @param organizerId - The UUID of the event organizer
 * @returns Array of transactions with event and user details
 */
function GetTransactionService(organizerId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transactions = yield prisma_1.default.transaction.findMany({
                where: {
                    event: {
                        organizer_id: organizerId,
                    },
                },
                include: {
                    event: {
                        select: {
                            name: true,
                            event_image: true,
                        },
                    },
                    user: {
                        select: {
                            username: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    created_at: "desc",
                },
            });
            return transactions;
        }
        catch (err) {
            throw err;
        }
    });
}
/**
 * Retrieves detailed information about a specific event
 *
 * @param eventId - The UUID of the event
 * @param organizerId - The UUID of the event organizer
 * @returns Detailed event object with transactions, reviews and vouchers
 */
function GetEventDetailsService(eventId, organizerId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const event = yield prisma_1.default.event.findUnique({
                where: {
                    id: eventId,
                    organizer_id: organizerId,
                },
                include: {
                    transactions: {
                        include: {
                            user: {
                                select: {
                                    username: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    review: {
                        include: {
                            user: {
                                select: {
                                    username: true,
                                },
                            },
                        },
                    },
                    voucher: true,
                },
            });
            if (!event)
                throw new Error("Event not found or you are not authorized");
            return event;
        }
        catch (err) {
            throw err;
        }
    });
}
/**
 * Updates an event with new data
 *
 * @param eventId - The UUID of the event to update
 * @param organizerId - The UUID of the event organizer
 * @param updateData - Object containing fields to update
 * @returns Updated event object
 */
function UpdateEventService(eventId, organizerId, updateData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const existingEvent = yield prisma_1.default.event.findUnique({
                where: {
                    id: eventId,
                    organizer_id: organizerId,
                },
            });
            if (!existingEvent) {
                throw new Error("Event not found or you don't have permission to update it");
            }
            const updatedEvent = yield prisma_1.default.event.update({
                where: {
                    id: eventId,
                },
                data: updateData,
            });
            return updatedEvent;
        }
        catch (err) {
            throw err;
        }
    });
}
function UpdateEventImageService(param) {
    return __awaiter(this, void 0, void 0, function* () {
        let imageUrl = null;
        let fileName = "";
        try {
            const { event_id, organizer_id, file } = param;
            // Check if event exists and organizer is the owner
            const event = yield prisma_1.default.event.findUnique({
                where: {
                    id: param.event_id,
                },
            });
            if (!event) {
                throw new Error("Event not found");
            }
            if (event.organizer_id !== organizer_id) {
                throw new Error("You don't have permission to update this event");
            }
            // Upload new image to cloudinary
            if (file) {
                const { secure_url } = yield (0, cloudinary_1.cloudinaryUpload)(file);
                imageUrl = secure_url;
                const splitUrl = secure_url.split("/");
                fileName = splitUrl[splitUrl.length - 1];
            }
            else {
                throw new Error("No file was provided");
            }
            // Use transaction for database operations avoiding orphaned file
            const result = yield prisma_1.default.$transaction((t) => __awaiter(this, void 0, void 0, function* () {
                // Get current event to check if we need to delete old event image
                const currentEvent = yield t.event.findUnique({
                    where: { id: event_id },
                    select: { event_image: true },
                });
                // Update event's image
                const updatedEvent = yield t.event.update({
                    where: { id: event_id },
                    data: {
                        event_image: fileName,
                    },
                });
                return {
                    updatedEvent,
                    oldImage: currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.event_image,
                };
            }));
            // Remove old image if it exists
            try {
                if (result.oldImage) {
                    yield (0, cloudinary_1.cloudinaryRemove)(result.oldImage);
                }
            }
            catch (cleanupErr) {
                console.error("Failed to remove old image", cleanupErr);
                // Non-critical error, don't throw
            }
            // Return the updated event
            return result.updatedEvent;
        }
        catch (error) {
            // Cleanup Cloudinary if upload succeeded but something else failed
            if (imageUrl) {
                yield (0, cloudinary_1.cloudinaryRemove)(imageUrl);
            }
            throw error;
        }
    });
}
