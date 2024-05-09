import { defineRouteHandler } from "../defineRouteHandler";
import {
  checkSignature,
  dataOperationBySliceInEventLoop,
  tryAwait,
} from "../../utils";
import { getUserInfo, getUsers, sendFactorResult, sendMessage } from "../../io";
import { useWxMsg } from "../../hooks/useWxMsg";
import { User, syncUser } from "../../db/user";
import { Op } from "sequelize";

defineRouteHandler("/oa/kungfu", (router) => {
  const wxMsgHandler = useWxMsg();

  wxMsgHandler.on("text", (msg, req, res) => {
    console.log("text msg", msg);
    if (req.wxOpenid && msg?.MsgType === "text") {
      sendMessage(req.wxOpenid, {
        msgtype: "text",
        text: {
          content: `收到消息：${msg.Content}`,
        },
      });
      sendMessage(req.wxOpenid, {
        msgtype: "image",
        text: {
          media_id: "test123",
        },
      });
    }
  });

  wxMsgHandler.on("event.subscribe", async (msg, req, res) => {
    console.log("subscribe", msg);

    if (req.wxUnionid) {
      const [err] = await tryAwait(
        syncUser(
          {
            wx_unionid: req.wxUnionid,
          },
          {
            kf_oa_openid: req.wxOpenid,
          }
        )
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
    // if (req.wxSource) {
    console.log("Received wx message");
    console.log("query", req.query);
    console.log("body", req.body);
    console.log("method", req.method);
    if (req.method === "GET") {
      return res.status(200).send(req.query.echostr);
    } else if (req.method === "POST") {
      const msg = (req.body.xml || req.body) as WxMsg.AllMsg;

      wxMsgHandler.emit(msg, req, res);

      return res.status(200).send("success");
    }
    // }

    // res.success("非法请求");
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

  router.post("/notify/factor", async (req, res) => {
    const { valid, payload } = req.payload({
      type: {
        type: ["featured", "self"] as const,
      },
      moduleName: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    });

    if (valid) {
      const { moduleName, name } = payload;

      const users = await User.findAll({
        where: {
          subscribed_factor: true,
          kf_oa_openid: {
            [Op.not]: null,
          },
        },
      });

      console.log(
        "users",
        users.length,
        users.map((u) => u.kf_oa_openid).join(", ")
      );

      dataOperationBySliceInEventLoop(
        users,
        (user) => {
          if (user.kf_oa_openid) {
            return sendFactorResult({
              openid: user.kf_oa_openid,
              factorType: "featured",
              factorName: payload.name,
              moduleName,
            });
          }
        },
        200
      ).then(() => res.success("ok"));
    }
  });
});
