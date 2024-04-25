import { defineRouteHandler } from "../defineRouteHandler";
import { checkSignature } from "../../utils";
import { getUserInfo, getUsers, sendTemplateMsg } from "../../io";

defineRouteHandler("/oa/kungfu", (router) => {
  router.all("/message", async (req, res) => {
    const result = checkSignature(req.query);

    if (result) {
      console.log("Received wx message");
      if (req.method === "GET") {
        return res.status(200).send(req.query.echostr);
      } else if (req.method === "POST") {
        const xml = req.body.xml;
        console.log("xml", JSON.stringify(xml));

        return;
      }
    }

    res.error("非法请求");
  });

  router.get("/users", async (req, res) => {
    res.success(await getUsers());
  });

  router.get("/userInfo", async (req, res) => {
    console.log("userInfo", req.query);
    console.log("params", req.params);
    if (!req.query.openid) return res.error("openid 不能为空");
    if (typeof req.query.openid === "string") {
      res.success(await getUserInfo(req.query.openid));
    } else {
      res.error("openid 需为字符串");
    }
  });

  router.post("/sendTemplateMsg", async (req, res) => {
    console.log("sendTemplateMsg", req.body);
    if (!req.body.openid) return res.send({ code: 1, msg: "openid 不能为空" });
    res.success(await sendTemplateMsg(req.body.openid));
  });
});