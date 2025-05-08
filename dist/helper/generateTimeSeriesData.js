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
exports.generateTimeSeriesData = generateTimeSeriesData;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const dateFilter_1 = require("./dateFilter");
function generateTimeSeriesData(organizerId, timeFilter) {
    return __awaiter(this, void 0, void 0, function* () {
        const dateFilter = yield (0, dateFilter_1.BuildDateFilter)(timeFilter);
        const whereClause = { organizer_id: organizerId };
        if (dateFilter) {
            whereClause.created_at = dateFilter;
        }
        // Get all events in the period
        const events = yield prisma_1.default.event.findMany({
            where: whereClause,
            include: {
                transactions: {
                    where: {
                        status: client_1.transaction_status.confirmed,
                    },
                },
            },
            orderBy: {
                start_date: "asc",
            },
        });
        // Group by day, month, or year based on timeFilter
        const groupBy = (timeFilter === null || timeFilter === void 0 ? void 0 : timeFilter.filterType) || "month";
        const seriesData = {};
        events.forEach((event) => {
            let dateKey;
            const date = new Date(event.start_date);
            if (groupBy === "day") {
                dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
            }
            else if (groupBy === "month") {
                dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
            }
            else {
                dateKey = date.getFullYear().toString(); // YYYY
            }
            if (!seriesData[dateKey]) {
                seriesData[dateKey] = {
                    events: 0,
                    attendees: 0,
                    revenue: 0,
                };
            }
            // Count this event
            seriesData[dateKey].events += 1;
            // Add attendees and revenue from transactions
            event.transactions.forEach((tx) => {
                seriesData[dateKey].attendees += tx.quantity;
                seriesData[dateKey].revenue += tx.total_pay_amount;
            });
        });
        // Convert to array format for charts
        return Object.entries(seriesData).map(([date, data]) => (Object.assign({ date }, data)));
    });
}
