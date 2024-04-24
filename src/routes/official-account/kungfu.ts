import { defineRouteHandler } from "../defineRouteHandler";
import { checkSignature } from "../../utils";
import { getUserInfo, getUsers, sendTemplateMsg } from "../../io";

export const kungfuOARouteHandler = defineRouteHandler(
  "/oa/kungfu",
  (router) => {
    router.all("/message", async (req, res) => {
      console.log("Received wx message");
      console.log("method", req.method);
      console.log("body", req.body);
      console.log("params", req.params);
      console.log("query", req.query);
      const result = checkSignature(req.query);
      res.send(result && req.query.echostr);
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
      if (!req.body.openid)
        return res.send({ code: 1, msg: "openid 不能为空" });
      res.success(await sendTemplateMsg(req.body.openid));
    });
  }
);
