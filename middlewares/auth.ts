import { NextFunction, Request, RequestHandler, Response } from "express";
import createHttpError = require("http-errors");
import { UserSession } from "../global";
import UserModel, { IUser } from "../models/Users";

export const NotFound = () => createHttpError(404, Error("Not Found!"));
export const Unauthorized = () =>
   createHttpError(401, Error("Unauthorized!"));
export const Forbidden = () =>
   createHttpError(403, Error("Forbidden access!"));

export const IsLoggedIn: RequestHandler = (req, res, next) => {
   const user = req.session.user;
   // console.log(req.session);
   if (!user) return next(Unauthorized);
   next();
};

export async function HasRoleAdmin(
   req: Request,
   res: Response,
   next: NextFunction
) {
   const requser = req.user;
   if (!requser) return next(Unauthorized());

   if (!UserHasRole(requser, "admin")) {
      return next(Forbidden());
   }

   next();
}

export function UserHasRole(user: UserSession, role: string) {
   return user.roles.findIndex((e) => e.name === role) !== -1;
}
