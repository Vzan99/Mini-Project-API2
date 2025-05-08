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
exports.CreateEventController = CreateEventController;
exports.GetEventByIdController = GetEventByIdController;
exports.SearchEventsController = SearchEventsController;
exports.FilterEventsController = FilterEventsController;
const event_service_1 = require("../services/event.service");
function CreateEventController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const organizerId = req.user.id;
            const event = yield (0, event_service_1.CreateEventService)(Object.assign(Object.assign({}, req.body), { file: req.file, // Multer-attached file
                organizerId }));
            res.status(201).json({
                message: "Event created successfully",
                data: event,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function GetEventByIdController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Use the validated params
            const { id } = req.validatedParams;
            const event = yield (0, event_service_1.GetEventByIdService)(id);
            res.status(200).json({
                message: "Event retrieved successfully",
                data: event,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function SearchEventsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Use the validated query parameters with the new name
            const { query, limit } = req.validatedQuery;
            const events = yield (0, event_service_1.SearchEventsService)(query, limit);
            res.status(200).json({
                message: "Search results retrieved successfully",
                count: events.length,
                data: events,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function FilterEventsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Since query parameters have already been validated by QueryValidator,
            // you can just pass them to the service directly.
            const filters = req.validatedQuery;
            // Call the service to get filtered events
            const events = yield (0, event_service_1.FilterEventsService)(filters);
            // Send response
            res.status(200).json({
                message: "Filtered events retrieved successfully",
                events,
            });
        }
        catch (err) {
            next(err); // Pass the error to the error handling middleware
        }
    });
}
