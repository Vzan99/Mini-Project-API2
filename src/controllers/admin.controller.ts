import { Request, Response, NextFunction } from "express";
import {
  GetOrganizerProfileService,
  FilterEventsService,
  GetCardSectionsService,
} from "../services/admin.service";
import { category } from "@prisma/client";

async function GetOrganizerProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizerId = String(req.params.id);

    // if (isNaN(organizerId)) {
    //   throw new Error("Invalid organizer ID");
    // }

    const profile = await GetOrganizerProfileService(organizerId);

    res.status(200).json({
      message: "Get organizer profile success!",
      profile,
    });
  } catch (err) {
    next(err);
  }
}

async function FilterEventsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Since query parameters have already been validated by QueryValidator,
    // you can just pass them to the service directly.
    const filters = (req as any).validatedQuery;

    // Call the service to get filtered events
    const events = await FilterEventsService(filters);

    // Send response
    res.status(200).json({
      message: "Filtered events retrieved successfully",
      events,
    });
  } catch (err) {
    next(err); // Pass the error to the error handling middleware
  }
}

async function GetCardSectionsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categoryFilter = req.query.category as category | undefined;
    const sections = await GetCardSectionsService(categoryFilter);

    res.status(200).json({
      message: "Landing page sections fetched successfully.",
      data: sections,
    });
  } catch (err) {
    next(err);
  }
}

export {
  GetOrganizerProfileController,
  FilterEventsController,
  GetCardSectionsController,
};
