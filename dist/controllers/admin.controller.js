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
exports.GetOrganizerProfileController = GetOrganizerProfileController;
exports.GetCardSectionsController = GetCardSectionsController;
exports.GetUniqueLocationsController = GetUniqueLocationsController;
const admin_service_1 = require("../services/admin.service");
function GetOrganizerProfileController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const organizer_id = String(req.params.id);
            const profile = yield (0, admin_service_1.GetOrganizerProfileService)(organizer_id);
            res.status(200).json({
                message: "Get organizer profile success!",
                profile,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function GetCardSectionsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const categoryFilter = req.query.category;
            const sections = yield (0, admin_service_1.GetCardSectionsService)(categoryFilter);
            res.status(200).json({
                message: "Landing page sections fetched successfully.",
                data: sections,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function GetUniqueLocationsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const locations = yield (0, admin_service_1.GetUniqueLocationsService)();
            res.status(200).json({
                message: "Unique locations fetched successfully",
                data: locations,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
