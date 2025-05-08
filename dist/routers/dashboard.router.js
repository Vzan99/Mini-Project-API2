"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const roleChecker_middleware_1 = require("../middlewares/roleChecker.middleware");
const paramValidator_middleware_1 = __importDefault(require("../middlewares/paramValidator.middleware"));
const reqValidator_middleware_1 = __importDefault(require("../middlewares/reqValidator.middleware"));
const event_schema_1 = require("../schemas/event.schema");
const dashboard_schema_1 = require("../schemas/dashboard.schema");
const multer_1 = require("../utils/multer");
const router = (0, express_1.Router)();
// Get all events created by the organizer
router.get("/events", auth_middleware_1.TokenVerification, (0, roleChecker_middleware_1.RoleChecker)(["event_organizer", "dev_admin"]), dashboard_controller_1.GetOrganizerEventsController);
// Get statistics for events
router.get("/statistics", auth_middleware_1.TokenVerification, (0, roleChecker_middleware_1.RoleChecker)(["event_organizer", "dev_admin"]), dashboard_controller_1.GetEventStatisticsController);
// Get all transactions for events
router.get("/transactions", auth_middleware_1.TokenVerification, (0, roleChecker_middleware_1.RoleChecker)(["event_organizer", "dev_admin"]), dashboard_controller_1.GetTransactionsController);
// Get detailed information about a specific event
router.get("/events/:id", auth_middleware_1.TokenVerification, (0, roleChecker_middleware_1.RoleChecker)(["event_organizer", "dev_admin"]), (0, paramValidator_middleware_1.default)(event_schema_1.eventIdSchema), dashboard_controller_1.GetEventDetailsController);
// Update an event
router.put("/events/:id", auth_middleware_1.TokenVerification, (0, roleChecker_middleware_1.RoleChecker)(["event_organizer", "dev_admin"]), (0, paramValidator_middleware_1.default)(event_schema_1.eventIdSchema), (0, reqValidator_middleware_1.default)(dashboard_schema_1.updateEventSchema), dashboard_controller_1.UpdateEventController);
// Update event image
router.put("/events/:id/image", auth_middleware_1.TokenVerification, (0, roleChecker_middleware_1.RoleChecker)(["event_organizer", "dev_admin"]), (0, paramValidator_middleware_1.default)(event_schema_1.eventIdSchema), // Validasi ID event
(0, multer_1.Multer)().single("eventImage"), // Handle file upload
dashboard_controller_1.UpdateEventImageController);
exports.default = router;
