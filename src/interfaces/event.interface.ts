import { category } from "@prisma/client";

export interface ICreateEventParam {
  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
  file?: Express.Multer.File;
  location: string;
  price: number;
  totalSeats: number;
  category: category;
  organizerId: string;
}

//hanya untuk exercise upload foto
export interface IUpdateEventImage {
  file: Express.Multer.File;
  // eventId: int;
}
