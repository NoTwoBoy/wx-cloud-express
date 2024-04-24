import path from "path";
import fs from "fs";
import { Express } from "express";

import { handlers } from "./defineRouteHandler";

// 将父级文件夹下的所有文件递归import一遍
const requireEveryFile = (dirPath: string) => {
  const res = fs.readdirSync(dirPath);

  res.forEach((pathname) => {
    const fullPath = path.join(dirPath, pathname);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      requireEveryFile(fullPath);
    } else {
      require(fullPath);
    }
  });
};

export const registerRoutes = (app: Express) => {
  requireEveryFile(__dirname);

  handlers.forEach((handler) => handler(app));
};
