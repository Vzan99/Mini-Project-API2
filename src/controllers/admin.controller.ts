import { Request, Response, NextFunction } from "express";
import {
  GetOrganizerProfileService,
  GetCardSectionsService,
  GetUniqueLocationsService,
  GetUserProfileService,
} from "../services/admin.service";
import { category } from "@prisma/client";

async function GetOrganizerProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizer_id = String(req.params.id);

    const profile = await GetOrganizerProfileService(organizer_id);

    res.status(200).json({
      message: "Get organizer profile success!",
      profile,
    });
  } catch (err) {
    next(err);
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

async function GetUniqueLocationsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const locations = await GetUniqueLocationsService();

    res.status(200).json({
      message: "Unique locations fetched successfully",
      data: locations,
    });
  } catch (err) {
    next(err);
  }
}

export {
  GetOrganizerProfileController,
  GetCardSectionsController,
  GetUniqueLocationsController,
};
