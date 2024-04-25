import express from "express";
import cors from "cors";
import morgan from "morgan";
import xmlParser from "express-xml-bodyparser";

import wxRequest from "./middleware/wxRequest";
import response from "./middleware/response";

import { registerRoutes } from "./routes";

import { init as initDB } from "./db";

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.raw());
app.use(express.json());
app.use(xmlParser());
app.use(cors());
app.use(wxRequest);
app.use(response);
app.use(logger);

registerRoutes(app);

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
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
