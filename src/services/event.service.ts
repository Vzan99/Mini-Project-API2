import prisma from "../lib/prisma";
import { ICreateEventParam } from "../interfaces/event.interface";
import { cloudinaryUpload, cloudinaryRemove } from "../utils/cloudinary";
import { UUID } from "crypto";
import { FilterParams } from "../interfaces/filter.interface";

async function CreateEventService(param: ICreateEventParam) {
  let imageUrl: string | null = null;
  let fileName = "";
  try {
    // 1) Upload to Cloudinary if a file was provided
    if (param.file) {
      const { secure_url } = await cloudinaryUpload(param.file);
      imageUrl = secure_url;
      const splitUrl = secure_url.split("/");
      fileName = splitUrl[splitUrl.length - 1];
    }

    // 2) Duplicate-check
    const dup = await prisma.event.findFirst({
      where: {
        name: param.name,
        start_date: param.startDate,
        end_date: param.endDate,
        location: param.location,
      },
    });
    if (dup) throw new Error("An event with the same details already exists.");

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
    const event = await prisma.event.create({
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
  } catch (err) {
    // 5) Cleanup Cloudinary if upload succeeded but something else failed
    if (imageUrl) {
      await cloudinaryRemove(imageUrl);
    }
    throw err;
  }
}

async function GetEventByIdService(id: string) {
  try {
    const event = await prisma.event.findUnique({
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
  } catch (err) {
    throw err;
  }
}

async function SearchEventsService(searchTerm: string, limit: number = 10) {
  try {
    // Search for events that match the search term in name, description, or location
    const events = await prisma.event.findMany({
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

    // Price filters - handle freeOnly first
    if (filters.freeOnly) {
      whereClause.price = 0;
    } else if (
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined
    ) {
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
    } else {
      // Use existing date range filters only if specificDate is not provided
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
      return { message: "No events found matching the filters." };
    }

    return events;
  } catch (err) {
    throw err;
  }
}

export {
  CreateEventService,
  GetEventByIdService,
  SearchEventsService,
  FilterEventsService,
};
