import path from "path";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import response from "./middleware/response";

import { registerRoutes } from "./routes";

import { init as initDB } from "./db";

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.raw());
app.use(express.json());
app.use(cors());
app.use(response);
app.use(logger);

registerRoutes(app);

function printRoutes(app: express.Express) {
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      // 如果是路由中间件则打印出路径
      console.log(middleware.route.path);
    } else if (middleware.name === "router") {
      // 对于路由器中间件
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          console.log(handler.route.path);
        }
      });
    }
  });
}

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
    console.log("All Routes: ");
    printRoutes(app);
  });
}

process.addListener("uncaughtException", (err) => {
  console.error("uncaughtException", err);
});

process.addListener("unhandledRejection", (err) => {
  console.error("unhandledRejection", err);
});

bootstrap();

export { app };
