import { category } from "@prisma/client";

export interface ICreateEventParam {
  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
  eventImage?: string;
  location: string;
  price: number;
  totalSeats: number;
  category: category;
}
