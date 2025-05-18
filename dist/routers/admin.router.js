"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// Get Organizers data
router.get("/organizers/:id", admin_controller_1.GetOrganizerProfileController);
// Get Card data for Each Sections (Only for home page)
router.get("/sections", admin_controller_1.GetCardSectionsController);
// Get unique locations for filtering
router.get("/locations", admin_controller_1.GetUniqueLocationsController);
exports.default = router;
