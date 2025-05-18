"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const reqValidator_middleware_1 = __importDefault(require("../middlewares/reqValidator.middleware"));
const queryValidator_middleware_1 = __importDefault(require("../middlewares/queryValidator.middleware"));
const paramValidator_middleware_1 = __importDefault(require("../middlewares/paramValidator.middleware"));
const event_schema_1 = require("../schemas/event.schema");
const multer_1 = require("../utils/multer");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const roleChecker_middleware_1 = require("../middlewares/roleChecker.middleware");
const router = (0, express_1.Router)();
// Search events
router.get("/search", (0, queryValidator_middleware_1.default)(event_schema_1.searchEventSchema), event_controller_1.SearchEventsController);
// Filter all events by category, location, date, and price using query
router.get("/filter", (0, queryValidator_middleware_1.default)(event_schema_1.filterEventSchema), event_controller_1.FilterEventsController);
// Get past events that the user has attended
router.get("/past", auth_middleware_1.TokenVerification, (0, queryValidator_middleware_1.default)(event_schema_1.pastEventsSchema), event_controller_1.GetPastEventsController);
// Get event by ID
router.get("/:id", (0, paramValidator_middleware_1.default)(event_schema_1.eventIdSchema), event_controller_1.GetEventByIdController);
// Create Event
router.post("/", auth_middleware_1.TokenVerification, (0, roleChecker_middleware_1.RoleChecker)(["event_organizer", "dev_admin"]), (0, multer_1.Multer)().single("eventImage"), (0, reqValidator_middleware_1.default)(event_schema_1.createEventSchema), event_controller_1.CreateEventController);
exports.default = router;
