import { role } from "@prisma/client"; //import enum from prisma

export interface IRegisterParam {
  id?: string; // Make id optional
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  username: string; // Required username field
  referral_code?: string; // Optional referral code from another user
  role?: role; // optional as the default param is customer
}

export interface ILoginParam {
  email: string;
  password: string;
}

export interface IJwtPayloadParam {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: role;
}
