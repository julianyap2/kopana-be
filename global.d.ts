import express = require("express");
import { NextFunction, Request, RequestHandler, Response } from "express";
import session from "express-session";
import { IUser } from "./models/Users";
import mongoose from "mongoose";

interface UserSession extends Omit<IUser, 'password'> {
   _id: mongoose.Schema.Types.ObjectId;
}

declare global {
   type HttpMethod = "get" | "post" | "put" | "all" | "options" | "delete";

   interface ControllerRoute {
      method: HttpMethod;
      action: RequestHandler | RequestHandler[];
   }

   type Controller = Record<
      string,
      ControllerRoute | ControllerRoute[]
   > & {
      middlewares?: RequestHandler[];
   };

   namespace Express {
      interface Request {
         user?: UserSession;
      }
   }
}

declare module "express-session" {
   interface SessionData {
      user: UserSession;
   }
}
