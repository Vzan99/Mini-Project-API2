import { category } from "@prisma/client";

export interface ICreateEventParam {
  name: string;
  start_date: Date;
  end_date: Date;
  description: string;
  file?: Express.Multer.File;
  location: string;
  price: number;
  total_seats: number;
  category: category;
  organizer_id: string;
}
