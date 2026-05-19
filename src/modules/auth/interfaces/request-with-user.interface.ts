import { Request } from "express";
import { UserPayload } from "./user-payload.interface";

export interface RequestWithUser extends Request {
  user: UserPayload;
}