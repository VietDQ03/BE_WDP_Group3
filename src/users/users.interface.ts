import { HRStatus } from "./schemas/user.schema";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  age: string;
  gender: boolean;
  company: string;
  address: string;
  role: {
    _id: string;
    name: string;
  };
  permissions?: {
    _id: string;
    name: string;
    apiPath: string;
    module: string;
  }[];
  premium: number;
  isDeleted: boolean;
  isActived: boolean;
  hr: HRStatus;
}
