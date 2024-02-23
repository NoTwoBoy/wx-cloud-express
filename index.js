const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { init: initDB, Counter } = require("./db");
const { getUsers, sendTemplateMsg, getUserInfo } = require("./io");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.raw());
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.all("/api/wxMessage", async (req, res) => {
  console.log("received wx message");
  console.log("method", req.method);
  console.log("body", req.body);
  console.log("params", req.params);
  console.log("query", req.query);
  res.send("success");
});

app.get("/api/users", async (req, res) => {
  res.send(await getUsers());
});

app.get("/api/userInfo", async (req, res) => {
  console.log("userInfo", req.query);
  console.log("params", req.params);
  if (!req.query.openid) return res.send({ code: 1, msg: "openid 不能为空" });
  res.send(await getUserInfo(req.query.openid));
});

app.post("/api/sendTemplateMsg", async (req, res) => {
  console.log("sendTemplateMsg", req.params);
  if (!req.params.openid) return res.send({ code: 1, msg: "openid 不能为空" });
  res.send(await sendTemplateMsg(req.params.openid));
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
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  res.send({
    code: 0,
    data: result,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
