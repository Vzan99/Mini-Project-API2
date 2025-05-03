import prisma from "../lib/prisma";
import { FilterParams } from "../interfaces/filter.interface";
import { category } from "@prisma/client";

async function GetOrganizerProfileService(organizerId: string) {
  try {
    // Ensure the user is actually an event_organizer
    const user = await prisma.user.findUnique({
      where: { id: organizerId },
      select: { role: true },
    });

    if (!user || user.role !== "event_organizer") {
      throw new Error("User is not an event organizer");
    }

    // Fetch all events created by this organizer
    const events = await prisma.event.findMany({
      where: { organizer_id: organizerId },
      include: {
        review: {
          include: {
            user: { select: { username: true } }, // reviewer name
          },
        },
      },
    });

    // Flatten all reviews
    const allReviews = events.flatMap((event) => event.review);

    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    return {
      averageRating,
      totalReviews: allReviews.length,
      reviews: allReviews,
      events: events.map((e) => ({
        id: e.id,
        name: e.name,
        startDate: e.start_date,
        endDate: e.end_date,
        totalReviews: e.review.length,
      })),
    };
  } catch (err) {
    throw err;
  }
}

async function FilterEventsService(filters: FilterParams) {
  try {
    const whereClause: any = {};
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

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      whereClause.price = {};
      if (filters.minPrice !== undefined) {
        whereClause.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        whereClause.price.lte = filters.maxPrice;
      }
    }

    // Date range filter
    if (filters.startDate) {
      whereClause.start_date = { gte: filters.startDate };
    } else {
      whereClause.start_date = { gte: now };
    }

    if (filters.endDate) {
      whereClause.end_date = {
        ...(whereClause.end_date || {}),
        lte: filters.endDate,
      };
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

    // Query the database with pagination and sorting
    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: {
        [sortBy]: sortOrder,
      },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        review: true,
      },
    });

    // Handle no results found
    if (events.length === 0) {
      return { message: "No events found matching the filters." };
    }

    return events;
  } catch (err) {
    throw err;
  }
}

async function GetCardSectionsService(categoryFilter?: category) {
  try {
    const now = new Date();

    const categoriesToFetch = categoryFilter
      ? [categoryFilter]
      : Object.values(category);

    const sections = await Promise.all(
      categoriesToFetch.map(async (categoryValue) => {
        const events = await prisma.event.findMany({
          where: {
            category: categoryValue,
            start_date: { gt: now },
          },
          orderBy: { start_date: "asc" },
          take: 3,
          select: {
            id: true,
            name: true,
            event_image: true,
            location: true,
            start_date: true,
            end_date: true,
          },
        });

        return { category: categoryValue, events };
      })
    );

    return sections;
  } catch (err) {
    throw err;
  }
}

export {
  GetOrganizerProfileService,
  FilterEventsService,
  GetCardSectionsService,
};
