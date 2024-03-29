const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const crypto = require("crypto");

const { TOKEN } = require("./config");
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

const checkSignature = (query) => {
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
  console.log("sendTemplateMsg", req.body);
  if (!req.body.openid) return res.send({ code: 1, msg: "openid 不能为空" });
  res.send(await sendTemplateMsg(req.body.openid));
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
