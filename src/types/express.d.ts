import { IJwtPayload } from "../interfaces/user.interface";

// Pastikan ini sama persis dengan IJwtPayload
export interface IUserReqParam {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayloadParam; // Tambahkan properti user ke dalam Request
    }
  }
}
