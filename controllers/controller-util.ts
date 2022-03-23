import type { RequestHandler, Router } from "express";

export function DefineRoute(method: HttpMethod, ...action: RequestHandler[]) {
   return {
      method,
      action,
   };
}

export function ApplyController(router: Router) {
   return (...controllers: Controller[]) => {
      for (const controller of controllers) {
         const { middlewares = [] } = controller;

         for (const key in controller) {
            const route = controller[key];

            if (!route) continue;

            if (Array.isArray(route)) {
               for (const r of route) {
                  let { method, action } = r;
                  if (!method && !action) continue;

                  action = middlewares.concat(
                     Array.isArray(action) ? action : [action]
                  );
                  method && action && router[method](key, action);
               }
            } else {
               if (!route.action && !route.method) continue;

               let { method, action } = route;
               action = middlewares.concat(
                  Array.isArray(action) ? action : [action]
               );
               method && action && router[method](key, ...action);
            }
         }
      }

      return router;
   };
}
