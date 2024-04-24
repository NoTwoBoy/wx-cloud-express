import { Express, IRouter, Router } from "express";

const ApiPrefix = "/api";

type Handler = (app: Express) => void;

export const handlers: Handler[] = [];

export const defineRouteHandler = <T extends string>(
  baseRoute: T,
  setup: (route: IRouter) => void
) => {
  const handler: Handler = (app: Express) => {
    const route = Router();

    app.use(`${ApiPrefix}${baseRoute}`, route);

    setup(route);
  };

  handlers.push(handler);

  return handler;
};
