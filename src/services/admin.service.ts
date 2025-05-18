import prisma from "../lib/prisma";
import { category } from "@prisma/client";

async function GetOrganizerProfileService(organizer_id: string) {
  try {
    // Ensure the user is actually an event_organizer and get their profile data
    const user = await prisma.user.findUnique({
      where: { id: organizer_id },
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
      where: { organizer_id: organizer_id },
      include: {
        review: {
          include: {
            user: { select: { username: true } },
          },
        },
      },
    });

    // Flatten all reviews with event info
    const allReviews = events.flatMap((event) =>
      event.review.map((review) => ({
        ...review,
        event_name: event.name,
        event_id: event.id,
      }))
    );

    // Calculate average rating from all reviews
    const average_rating =
      allReviews.length > 0
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) /
          allReviews.length
        : 0;

    return {
      organizer: {
        id: organizer_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_picture: user.profile_picture,
      },
      average_rating,
      total_reviews: allReviews.length,
      reviews: allReviews,
      events: events.map((e) => ({
        id: e.id,
        name: e.name,
        start_date: e.start_date,
        end_date: e.end_date,
        location: e.location,
        price: e.price,
        total_seats: e.total_seats,
        remaining_seats: e.remaining_seats,
        category: e.category,
        event_image: e.event_image,
        total_reviews: e.review.length,
      })),
    };
  } catch (err) {
    throw err;
  }
}

async function GetCardSectionsService(category_filter?: category) {
  try {
    const now = new Date();

    const categoriesToFetch = category_filter
      ? [category_filter]
      : Object.values(category);

    // If a specific category is requested, just return events for that category
    if (category_filter) {
      const events = await prisma.event.findMany({
        where: {
          category: category_filter,
          end_date: { gt: now },
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

async function GetUserProfileService(user_id: string) {
  try {
    // Find the user by ID
    const user = await prisma.user.findUnique({
      where: { id: user_id },
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
    const total_active_points = user.points.reduce(
      (sum, point) => sum + point.points_amount,
      0
    );

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      profile_picture: user.profile_picture,
      role: user.role,
      points: {
        total_active_points,
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
