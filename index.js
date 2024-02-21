const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");
const { init: initDB, Counter } = require("./db");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.raw());
app.use(express.json());
app.use(cors());
app.use(logger);

const client = axios.default;

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.all("/api/wxMessage", async (req, res) => {
  const headers = req.headers;
  const weixinAPI = `http://api.weixin.qq.com/cgi-bin/message/custom/send`;
  const payload = {
    touser: headers["x-wx-openid"],
    msgtype: "text",
    text: {
      content: `云托管接收消息推送成功，内容如下：\n${JSON.stringify(
        req.body,
        null,
        2
      )}`,
    },
  };
  // dispatch to wx server
  const result = await client.post(weixinAPI, payload);
  console.log("received request", req.body, result.data);
  res.send("success");
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
