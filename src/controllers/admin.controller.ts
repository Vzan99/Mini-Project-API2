import { Request, Response, NextFunction } from "express";
import {
  GetOrganizerProfileService,
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

export { GetOrganizerProfileController, GetCardSectionsController };
