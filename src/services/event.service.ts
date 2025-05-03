import prisma from "../lib/prisma";
import { ICreateEventParam } from "../interfaces/event.interface";
import { cloudinaryUpload, cloudinaryRemove } from "../utils/cloudinary";

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

export { CreateEventService };
