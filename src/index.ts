import path from "path";
import crypto from "crypto";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import response from "./middleware/response";

import { TOKEN } from "./config";
import { init as initDB, Counter } from "./db";
import { getUsers, sendTemplateMsg, getUserInfo } from "./io";

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.raw());
app.use(express.json());
app.use(cors());
app.use(response);
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const checkSignature = (query: express.Request["query"]) => {
  const { nonce, signature, timestamp } = query;
  const sha1 = crypto.createHash("sha1");
  const str = [timestamp, nonce, TOKEN].sort().join("");
  sha1.update(str);
  const sha1str = sha1.digest("hex");
  console.log("sha1str", sha1str);
  return sha1str === signature;
};

app.all("/api/wxMessage", async (req, res) => {
  console.log("Received wx message");
  console.log("method", req.method);
  console.log("body", req.body);
  console.log("params", req.params);
  console.log("query", req.query);
  const result = checkSignature(req.query);
  res.send(result && req.query.echostr);
});

app.all("/api/kungfuMpMsg", async (req, res) => {
  console.log("Received kungfu mp message");
  console.log("method", req.method);
  console.log("body", req.body);
  console.log("params", req.params);
  console.log("query", req.query);
  const result = checkSignature(req.query);
  res.send(result && req.query.echostr);
});

app.get("/api/users", async (req, res) => {
  res.success(await getUsers());
});

app.get("/api/userInfo", async (req, res) => {
  console.log("userInfo", req.query);
  console.log("params", req.params);
  if (!req.query.openid) return res.error("openid 不能为空");
  if (typeof req.query.openid === "string") {
    res.success(await getUserInfo(req.query.openid));
  } else {
    res.error("openid 需为字符串");
  }
});

app.post("/api/sendTemplateMsg", async (req, res) => {
  console.log("sendTemplateMsg", req.body);
  if (!req.body.openid) return res.send({ code: 1, msg: "openid 不能为空" });
  res.success(await sendTemplateMsg(req.body.openid));
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.success(await Counter.count());
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  res.success(result);
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.success(req.headers["x-wx-openid"]);
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", "port", port);
  });
}

process.addListener("uncaughtException", (err) => {
  console.error("uncaughtException", err);
});

process.addListener("unhandledRejection", (err) => {
  console.error("unhandledRejection", err);
});

bootstrap();
