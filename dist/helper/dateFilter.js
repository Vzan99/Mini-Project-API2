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
exports.BuildDateFilter = BuildDateFilter;
function BuildDateFilter(timeFilter) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!timeFilter)
            return null;
        // Jika menggunakan filter_type (day, week, month, year)
        if (timeFilter.filter_type) {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const day = now.getDate();
            if (timeFilter.filter_type === "day") {
                const startDate = new Date(year, month, day);
                const endDate = new Date(year, month, day + 1);
                return { gte: startDate, lt: endDate };
            }
            if (timeFilter.filter_type === "week") {
                const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
                const startDay = day - currentDay + (currentDay === 0 ? -6 : 1); // Adjust to get Monday
                const startDate = new Date(year, month, startDay);
                const endDate = new Date(year, month, startDay + 7);
                return { gte: startDate, lt: endDate };
            }
            if (timeFilter.filter_type === "month") {
                const startDate = new Date(year, month, 1);
                const endDate = new Date(year, month + 1, 0);
                return { gte: startDate, lte: endDate };
            }
            if (timeFilter.filter_type === "year") {
                const startDate = new Date(year, 0, 1);
                const endDate = new Date(year, 11, 31);
                return { gte: startDate, lte: endDate };
            }
        }
        // Jika menggunakan year, month, day
        else {
            const { year, month, day } = timeFilter;
            if (year && month && day) {
                const startDate = new Date(year, month - 1, day);
                const endDate = new Date(year, month - 1, day + 1);
                return { gte: startDate, lt: endDate };
            }
            if (year && month) {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0); // Last day of month
                return { gte: startDate, lte: endDate };
            }
            if (year) {
                const startDate = new Date(year, 0, 1);
                const endDate = new Date(year, 11, 31);
                return { gte: startDate, lte: endDate };
            }
        }
        return null;
    });
}
