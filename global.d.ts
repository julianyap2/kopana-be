import { NextFunction, Request, RequestHandler, Response } from "express";

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
}
