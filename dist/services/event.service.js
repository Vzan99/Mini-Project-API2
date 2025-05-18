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
exports.GetPastEventsService = GetPastEventsService;
const prisma_1 = __importDefault(require("../lib/prisma"));
const cloudinary_1 = require("../utils/cloudinary");
const client_1 = require("@prisma/client");
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
                    start_date: param.start_date,
                    end_date: param.end_date,
                    location: param.location,
                },
            });
            if (dup)
                throw new Error("An event with the same details already exists.");
            // 3) Business validations
            if (param.end_date <= param.start_date) {
                throw new Error("End date must be after start date.");
            }
            if (param.price < 0) {
                throw new Error("Price must be zero or greater.");
            }
            if (param.total_seats <= 0) {
                throw new Error("Total seats must be greater than zero.");
            }
            // 4) Create the event record
            const event = yield prisma_1.default.event.create({
                data: {
                    name: param.name,
                    start_date: param.start_date,
                    end_date: param.end_date,
                    description: param.description,
                    event_image: fileName,
                    location: param.location,
                    price: param.price,
                    total_seats: param.total_seats,
                    remaining_seats: param.total_seats,
                    category: param.category,
                    organizer_id: param.organizer_id,
                },
            });
            return event;
        }
        catch (err) {
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
                    organizer: true,
                    transactions: true,
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
                    start_date: "asc",
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
            // Price filters - handle free_only first
            if (filters.free_only) {
                whereClause.price = 0;
            }
            else if (filters.min_price !== undefined ||
                filters.max_price !== undefined) {
                whereClause.price = {};
                if (filters.min_price !== undefined) {
                    whereClause.price.gte = filters.min_price;
                }
                if (filters.max_price !== undefined) {
                    whereClause.price.lte = filters.max_price;
                }
            }
            // Available seats filter
            if (filters.available_seats_only) {
                whereClause.remaining_seats = { gt: 0 };
            }
            // Handle specific date filter
            if (filters.specific_date) {
                const specificDate = new Date(filters.specific_date);
                // Create start of day in user's local timezone, then convert to UTC for database comparison
                const startOfDay = new Date(Date.UTC(specificDate.getFullYear(), specificDate.getMonth(), specificDate.getDate(), 0, 0, 0, 0));
                // Create end of day in user's local timezone, then convert to UTC for database comparison
                const endOfDay = new Date(Date.UTC(specificDate.getFullYear(), specificDate.getMonth(), specificDate.getDate(), 23, 59, 59, 999));
                console.log(`Filtering for date: ${specificDate.toDateString()}`);
                console.log(`Start of day (UTC): ${startOfDay.toISOString()}`);
                console.log(`End of day (UTC): ${endOfDay.toISOString()}`);
                // Find events that overlap with this day
                whereClause.AND = [
                    { start_date: { lte: endOfDay } },
                    { end_date: { gte: startOfDay } },
                ];
            }
            else {
                // Use existing date range filters only if specificDate is not provided
                if (filters.start_date) {
                    whereClause.start_date = { gte: filters.start_date };
                }
                else {
                    whereClause.start_date = { gte: now };
                }
                if (filters.end_date) {
                    whereClause.end_date = Object.assign(Object.assign({}, (whereClause.end_date || {})), { lte: filters.end_date });
                }
            }
            // Sorting by field (e.g., name, price, start_date)
            const sortBy = filters.sort_by || "start_date";
            const sortOrder = filters.sort_order || "asc";
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
function GetPastEventsService(user_id_1) {
    return __awaiter(this, arguments, void 0, function* (user_id, page = 1, limit = 10) {
        try {
            const now = new Date();
            // Find events that have already ended
            const totalEvents = yield prisma_1.default.event.count({
                where: {
                    end_date: { lt: now },
                    transactions: {
                        some: {
                            user_id: user_id,
                            status: client_1.transaction_status.confirmed,
                        },
                    },
                },
            });
            const totalPages = Math.ceil(totalEvents / limit);
            const pastEvents = yield prisma_1.default.event.findMany({
                where: {
                    end_date: { lt: now },
                    transactions: {
                        some: {
                            user_id: user_id,
                            status: client_1.transaction_status.confirmed,
                        },
                    },
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
                    review: {
                        where: {
                            user_id: user_id,
                        },
                    },
                    transactions: {
                        where: {
                            user_id: user_id,
                            status: client_1.transaction_status.confirmed,
                        },
                        include: {
                            tickets: true,
                        },
                        take: 1,
                    },
                },
                orderBy: {
                    end_date: "desc",
                },
                take: limit,
                skip: (page - 1) * limit,
            });
            return {
                events: pastEvents,
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
