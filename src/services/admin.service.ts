import prisma from "../lib/prisma";
import { FilterParams } from "../interfaces/filter.interface";
import { category } from "@prisma/client";

async function GetOrganizerProfileService(organizerId: string) {
  try {
    // Ensure the user is actually an event_organizer and get their profile data
    const user = await prisma.user.findUnique({
      where: { id: organizerId },
      select: {
        role: true,
        username: true,
        first_name: true,
        last_name: true,
        profile_picture: true,
      },
    });

    if (!user || user.role !== "event_organizer") {
      throw new Error("User is not an event organizer");
    }

    // Fetch all events created by this organizer with more details
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
      organizer: {
        id: organizerId,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        profilePicture: user.profile_picture,
      },
      averageRating,
      totalReviews: allReviews.length,
      reviews: allReviews,
      events: events.map((e) => ({
        id: e.id,
        name: e.name,
        startDate: e.start_date,
        endDate: e.end_date,
        location: e.location,
        price: e.price,
        totalSeats: e.total_seats,
        remainingSeats: e.remaining_seats,
        category: e.category,
        eventImage: e.event_image,
        totalReviews: e.review.length,
      })),
    };
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

    // If a specific category is requested, just return events for that category
    if (categoryFilter) {
      const events = await prisma.event.findMany({
        where: {
          category: categoryFilter,
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

      // Return just the array of events
      return events;
    }
    // If no category filter, return events grouped by category
    else {
      const sectionsObject: { [key: string]: any[] } = {};

      await Promise.all(
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

          sectionsObject[categoryValue] = events;
        })
      );

      return sectionsObject;
    }
  } catch (err) {
    throw err;
  }
}

async function GetUniqueLocationsService() {
  try {
    // Get all unique locations from events
    const locations = await prisma.event.findMany({
      select: {
        location: true,
      },
      distinct: ["location"],
      orderBy: {
        location: "asc",
      },
    });

    // Extract just the location strings
    return locations.map((item) => item.location);
  } catch (err) {
    throw err;
  }
}

async function GetUserProfileService(userId: string) {
  try {
    // Find the user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        profile_picture: true,
        role: true,
        points: {
          where: {
            is_used: false,
            is_expired: false,
            expires_at: { gt: new Date() },
          },
          select: {
            id: true,
            points_amount: true,
            expires_at: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Calculate total active points
    const totalActivePoints = user.points.reduce(
      (sum, point) => sum + point.points_amount,
      0
    );

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      profilePicture: user.profile_picture,
      role: user.role,
      points: {
        totalActivePoints,
        details: user.points,
      },
    };
  } catch (err) {
    throw err;
  }
}

export {
  GetOrganizerProfileService,
  GetCardSectionsService,
  GetUniqueLocationsService,
  GetUserProfileService,
};
