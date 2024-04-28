import { defineRouteHandler } from "../defineRouteHandler";
import { checkSignature, tryAwait } from "../../utils";
import { getUserInfo, getUsers, sendTemplateMsg } from "../../io";
import { useWxMsg } from "../../hooks/useWxMsg";
import { syncUser } from "../../db/user";

defineRouteHandler("/oa/kungfu", (router) => {
  const wxMsgHandler = useWxMsg();

  wxMsgHandler.on("text", (msg, req, res) => {
    console.log("text msg", msg);
  });

  wxMsgHandler.on("event.subscribe", async (msg, req, res) => {
    console.log("subscribe", msg);

    if (req.wxUnionid) {
      const [err] = await tryAwait(
        syncUser({
          wx_unionid: req.wxUnionid,
          kf_oa_openid: req.wxOpenid,
        })
      );

      if (err) {
        console.error(err);
      }
    }
  });

  wxMsgHandler.on("event.unsubscribe", (msg, req, res) => {
    console.log("unsubscribe", msg);
  });

  router.all("/message", async (req, res) => {
    const result = checkSignature(req.query);

    if (result) {
      console.log("Received wx message");
      if (req.method === "GET") {
        return res.status(200).send(req.query.echostr);
      } else if (req.method === "POST") {
        const xml = req.body.xml as WxMsg.AllMsg;

        wxMsgHandler.emit(xml, req, res);

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
