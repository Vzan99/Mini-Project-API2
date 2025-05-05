import prisma from "../lib/prisma";
import { transaction_status } from "@prisma/client";

import { ITimeFilter } from "../interfaces/dashboard.interface";
import { BuildDateFilter } from "../helper/dateFilter";

async function getOrganizerStatisticServices(
  organizerId: string,
  timeFilter?: ITimeFilter
) {
  try {
    const dateFilter = BuildDateFilter(timeFilter);

    const events = await prisma.event.findMany({
      where: {
        organizer_id: organizerId,
        ...(dateFilter ? { created_at: dateFilter } : {}),
      },
    });
  } catch (err) {}
}
