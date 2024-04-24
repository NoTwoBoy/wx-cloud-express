import { Express } from "express";

import { handlers } from "./defineRouteHandler";

export const registerRoutes = (app: Express) => {
  handlers.forEach((handler) => handler(app));
};
