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
exports.CreateEventService = CreateEventService;
exports.GetEventByIdService = GetEventByIdService;
exports.SearchEventsService = SearchEventsService;
exports.FilterEventsService = FilterEventsService;
const prisma_1 = __importDefault(require("../lib/prisma"));
const cloudinary_1 = require("../utils/cloudinary");
function CreateEventService(param) {
    return __awaiter(this, void 0, void 0, function* () {
        let imageUrl = null;
        let fileName = "";
        try {
            // 1) Upload to Cloudinary if a file was provided
            if (param.file) {
                const { secure_url } = yield (0, cloudinary_1.cloudinaryUpload)(param.file);
                imageUrl = secure_url;
                const splitUrl = secure_url.split("/");
                fileName = splitUrl[splitUrl.length - 1];
            }
            // 2) Duplicate-check
            const dup = yield prisma_1.default.event.findFirst({
                where: {
                    name: param.name,
                    start_date: param.startDate,
                    end_date: param.endDate,
                    location: param.location,
                },
            });
            if (dup)
                throw new Error("An event with the same details already exists.");
            // 3) Business validations
            if (param.endDate <= param.startDate) {
                throw new Error("End date must be after start date.");
            }
            if (param.price < 0) {
                throw new Error("Price must be zero or greater.");
            }
            if (param.totalSeats <= 0) {
                throw new Error("Total seats must be greater than zero.");
            }
            // 4) Create the event record
            const event = yield prisma_1.default.event.create({
                data: {
                    name: param.name,
                    start_date: param.startDate,
                    end_date: param.endDate,
                    description: param.description,
                    event_image: fileName, // full URL or null
                    location: param.location,
                    price: param.price,
                    total_seats: param.totalSeats,
                    remaining_seats: param.totalSeats,
                    category: param.category,
                    organizer_id: param.organizerId, // ID dari user yang terautentikasi
                },
            });
            return event;
        }
        catch (err) {
            // 5) Cleanup Cloudinary if upload succeeded but something else failed
            if (imageUrl) {
                yield (0, cloudinary_1.cloudinaryRemove)(imageUrl);
            }
            throw err;
        }
    });
}
function GetEventByIdService(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const event = yield prisma_1.default.event.findUnique({
                where: { id },
                include: {
                    organizer: true, // Include the organizer's information if necessary
                    transactions: true, // You can include related data like transactions if needed
                    voucher: true,
                    review: true,
                },
            });
            if (!event) {
                throw new Error("Event not found");
            }
            return event;
        }
        catch (err) {
            throw err;
        }
    });
}
function SearchEventsService(searchTerm_1) {
    return __awaiter(this, arguments, void 0, function* (searchTerm, limit = 10) {
        try {
            // Search for events that match the search term in name, description, or location
            const events = yield prisma_1.default.event.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm, mode: "insensitive" } },
                        { description: { contains: searchTerm, mode: "insensitive" } },
                        { location: { contains: searchTerm, mode: "insensitive" } },
                    ],
                },
                take: limit,
                orderBy: {
                    start_date: "asc", // Sort by upcoming events first
                },
                include: {
                    organizer: {
                        select: {
                            id: true,
                            username: true,
                            first_name: true,
                            last_name: true,
                        },
                    },
                },
            });
            return events;
        }
        catch (err) {
            throw err;
        }
    });
}
function FilterEventsService(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const whereClause = {};
            const now = new Date();
            // Keyword search (name or description)
            if (filters.keyword) {
                whereClause.OR = [
                    { name: { contains: filters.keyword, mode: "insensitive" } },
                    { description: { contains: filters.keyword, mode: "insensitive" } },
                ];
            }
            // Category filter
            if (filters.category) {
                whereClause.category = filters.category;
            }
            // Location filter
            if (filters.location) {
                whereClause.location = {
                    contains: filters.location,
                    mode: "insensitive",
                };
            }
            // Price filters - handle freeOnly first
            if (filters.freeOnly) {
                whereClause.price = 0;
            }
            else if (filters.minPrice !== undefined ||
                filters.maxPrice !== undefined) {
                whereClause.price = {};
                if (filters.minPrice !== undefined) {
                    whereClause.price.gte = filters.minPrice;
                }
                if (filters.maxPrice !== undefined) {
                    whereClause.price.lte = filters.maxPrice;
                }
            }
            // Available seats filter
            if (filters.availableSeatsOnly) {
                whereClause.remaining_seats = { gt: 0 };
            }
            // Handle specific date filter (new)
            if (filters.specificDate) {
                // Find events where the specific date falls within the event's date range
                // (start_date <= specificDate <= end_date)
                whereClause.AND = [
                    { start_date: { lte: filters.specificDate } },
                    { end_date: { gte: filters.specificDate } },
                ];
            }
            else {
                // Use existing date range filters only if specificDate is not provided
                if (filters.startDate) {
                    whereClause.start_date = { gte: filters.startDate };
                }
                else {
                    whereClause.start_date = { gte: now };
                }
                if (filters.endDate) {
                    whereClause.end_date = Object.assign(Object.assign({}, (whereClause.end_date || {})), { lte: filters.endDate });
                }
            }
            // Sorting by field (e.g., name, price, start_date)
            const sortBy = filters.sortBy || "start_date"; // Default sort by start_date
            const sortOrder = filters.sortOrder || "asc"; // Default sort order is ascending
            // Validate sortBy field
            const validSortFields = ["name", "price", "start_date", "location"];
            if (!validSortFields.includes(sortBy)) {
                throw new Error("Invalid sort field.");
            }
            // Pagination
            const page = filters.page || 1;
            const limit = filters.limit || 10;
            // Count total matching events first (for pagination info)
            const totalEvents = yield prisma_1.default.event.count({
                where: whereClause,
            });
            // Calculate total pages
            const totalPages = Math.ceil(totalEvents / limit);
            // Query the database with pagination and sorting
            const events = yield prisma_1.default.event.findMany({
                where: whereClause,
                orderBy: {
                    [sortBy]: sortOrder,
                },
                take: limit,
                skip: (page - 1) * limit,
                include: {
                    organizer: {
                        select: {
                            id: true,
                            username: true,
                            first_name: true,
                            last_name: true,
                        },
                    },
                },
            });
            // Handle no results found
            if (events.length === 0) {
                return {
                    events: [],
                    pagination: {
                        total: totalEvents,
                        totalPages,
                        currentPage: page,
                        limit,
                    },
                };
            }
            return {
                events,
                pagination: {
                    total: totalEvents,
                    totalPages,
                    currentPage: page,
                    limit,
                },
            };
        }
        catch (err) {
            throw err;
        }
    });
}
