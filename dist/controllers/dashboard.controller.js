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
exports.GetOrganizerEventsController = GetOrganizerEventsController;
exports.GetEventStatisticsController = GetEventStatisticsController;
exports.GetTransactionsController = GetTransactionsController;
exports.GetEventDetailsController = GetEventDetailsController;
exports.UpdateEventController = UpdateEventController;
exports.UpdateEventImageController = UpdateEventImageController;
const dashboard_service_1 = require("../services/dashboard.service");
/**
 * Get all events created by the logged-in organizer
 */
function GetOrganizerEventsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const organizerId = req.user.id;
            const events = yield (0, dashboard_service_1.GetOrganizerEventsService)(organizerId);
            res.status(200).json({
                message: "Events retrieved successfully",
                data: events,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
/**
 * Get statistics for events created by the logged-in organizer
 */
function GetEventStatisticsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const organizer_id = req.user.id;
            const { filter_type, year, month, day } = req.query;
            // Build filter object from query parameters
            const timeFilter = {};
            if (filter_type) {
                timeFilter.filter_type = filter_type;
            }
            if (year)
                timeFilter.year = parseInt(year);
            if (month)
                timeFilter.month = parseInt(month);
            if (day)
                timeFilter.day = parseInt(day);
            const statistics = yield (0, dashboard_service_1.GetEventStatisticsService)(organizer_id, Object.keys(timeFilter).length > 0 ? timeFilter : undefined);
            res.status(200).json({
                message: "Statistics retrieved successfully",
                data: statistics,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
/**
 * Get all transactions for events created by the logged-in organizer
 */
function GetTransactionsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const organizer_id = req.user.id;
            const transactions = yield (0, dashboard_service_1.GetTransactionService)(organizer_id);
            res.status(200).json({
                message: "Transactions retrieved successfully",
                data: transactions,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
/**
 * Get detailed information about a specific event
 */
function GetEventDetailsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const organizer_id = req.user.id;
            const event_id = req.params.id;
            const eventDetails = yield (0, dashboard_service_1.GetEventDetailsService)(event_id, organizer_id);
            res.status(200).json({
                message: "Event details retrieved successfully",
                data: eventDetails,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
/**
 * Update an event
 */
function UpdateEventController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const organizer_id = req.user.id;
            const event_id = req.params.id;
            const update_data = req.body;
            const updatedEvent = yield (0, dashboard_service_1.UpdateEventService)(event_id, organizer_id, update_data);
            res.status(200).json({
                message: "Event updated successfully",
                data: updatedEvent,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function UpdateEventImageController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const organizer_id = req.user.id;
            const event_id = req.params.id;
            const file = req.file;
            if (!file) {
                throw new Error("No file was provided");
            }
            const updatedEvent = yield (0, dashboard_service_1.UpdateEventImageService)({
                organizer_id,
                event_id,
                file,
            });
            res.status(200).json({
                message: "Event image updated successfully",
                data: updatedEvent,
            });
        }
        catch (error) {
            next(error);
        }
    });
}
