import { ITimeFilter } from "../interfaces/dashboard.interface";

export async function BuildDateFilter(timeFilter?: ITimeFilter) {
  if (!timeFilter) return null;

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

  return null;
}
