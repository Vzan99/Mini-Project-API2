import { ICreateEventParam } from "../interfaces/event.interface";
import prisma from "../lib/prisma";

async function FindDuplicateEvent(
  name: string,
  startDate: Date,
  endDate: Date,
  location: string
) {
  try {
    //mencari nama event yang sama di kota yang sama dengan tanggal yang sama
    const data = await prisma.event.findFirst({
      where: {
        name: name,
        start_date: startDate,
        end_date: endDate,
        location: location,
      },
    });

    return data;
  } catch (err) {
    throw err;
  }
}

async function CreateEventService(param: ICreateEventParam) {
  try {
    const {
      name,
      startDate,
      endDate,
      description,
      eventImage,
      location,
      price,
      totalSeats,
      category,
    } = param;

    const isExist = await FindDuplicateEvent(
      name,
      startDate,
      endDate,
      location
    );

    if (isExist)
      throw new Error("Event yang sama sudah terdaftar di dalam database");

    if (endDate <= startDate)
      throw new Error("End date must be after start date.");

    if (price < 0) throw new Error("Price must be zero or greater.");

    if (totalSeats <= 0)
      throw new Error("Total seats must be greater than zero.");

    const event = await prisma.event.create({
      data: {
        name: name,
        start_date: startDate,
        end_date: endDate,
        description: description,
        event_image: eventImage ?? null,
        location: location,
        price: price,
        total_seats: totalSeats,
        remaining_seats: totalSeats,
        category: category,
        organizer_id: 2, // nanti di edit jadi id user hasil authentication
      },
    });

    return event;
  } catch (err) {
    throw err;
  }
}

export { CreateEventService };
