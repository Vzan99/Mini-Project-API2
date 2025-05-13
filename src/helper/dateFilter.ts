import { IDateFilterParams } from "../interfaces/dashboard.interface";

export async function BuildDateFilter(timeFilter?: IDateFilterParams) {
  if (!timeFilter) return null;

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
}
