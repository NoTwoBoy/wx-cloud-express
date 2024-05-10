import { Op } from "sequelize";
import { defineRouteHandler } from "../defineRouteHandler";
import {
  checkSignature,
  dataOperationBySliceInEventLoop,
  tryAwait,
} from "../../utils";
import {
  getAutoReplyInfo,
  getUserInfo,
  getUsers,
  sendFactorResult,
  sendMessage,
} from "../../io";
import { useWxMsg } from "../../hooks/useWxMsg";
import { useWxReply } from "../../hooks/useWxReply";
import { User, syncUser } from "../../db/user";

defineRouteHandler("/oa/kungfu", (router) => {
  const wxMsgHandler = useWxMsg();
  const wxReplyHandler = useWxReply();

  // wxReplyHandler.onKeywords(
  //   [/^test$/],
  //   [
  //     {
  //       MsgType: "text",
  //       Content: "测试成功",
  //     },
  //   ]
  // );

  // wxReplyHandler.onKeywords(
  //   [/^test2$/],
  //   [
  //     {
  //       MsgType: "text",
  //       Content: "测试成功1",
  //     },
  //     {
  //       MsgType: "text",
  //       Content: "测试成功2",
  //     },
  //   ]
  // );

  // wxReplyHandler.onKeywords(
  //   [/^test3$/],
  //   [
  //     {
  //       MsgType: "text",
  //       Content: "测试成功1",
  //     },
  //     {
  //       MsgType: "text",
  //       Content: "测试成功2",
  //     },
  //     {
  //       MsgType: "text",
  //       Content: "测试成功3",
  //     },
  //   ]
  // );

  // wxReplyHandler.onKeywords(
  //   [/^图片$/],
  //   [
  //     {
  //       MsgType: "image",
  //       Image: {
  //         MediaId:
  //           "CewqJ1zcRZ2hCc8d_BP2OF6hy-AB3jk13Nbf_s9vbtWxiz973ZM-EqyXDle5hVWh",
  //       },
  //     },
  //   ]
  // );

  // wxReplyHandler.onKeywords(
  //   [/^图片1$/],
  //   [
  //     {
  //       MsgType: "text",
  //       Content: "测试成功1",
  //     },
  //     {
  //       MsgType: "image",
  //       Image: {
  //         MediaId:
  //           "CewqJ1zcRZ2hCc8d_BP2OF6hy-AB3jk13Nbf_s9vbtWxiz973ZM-EqyXDle5hVWh",
  //       },
  //     },
  //   ]
  // );

  let wxAutoReplyConfig: WxAutoReply.Config | null = null;
  wxMsgHandler.on("text", async (msg, _, res) => {
    console.log("text msg", msg);
    if (!wxAutoReplyConfig) {
      wxAutoReplyConfig = await getAutoReplyInfo();
      wxReplyHandler.onWxAutoReplyConfig(wxAutoReplyConfig);
    }

    wxReplyHandler.triggerKeywordsReply(res, msg);
  });

  wxMsgHandler.on("event.subscribe", async (msg, req) => {
    console.log("subscribe", msg);

    if (req.wxUnionid) {
      const [err] = await tryAwait(
        syncUser(
          {
            wx_unionid: req.wxUnionid,
          },
          {
            kf_oa_openid: req.wxOpenid || msg.FromUserName,
          }
        )
      );

      if (err) {
        console.error(err);
      }
    }

    wxReplyHandler.triggerSubscribeReply(msg);
  });

  wxMsgHandler.on("event.unsubscribe", (msg) => {
    console.log("unsubscribe", msg);
  });

  router.all("/message", async (req, res) => {
    const valid = checkSignature(req.query);

    if (req.wxSource || valid) {
      console.log("Received wx message");
      console.log("query", req.query);
      console.log("body", req.body);
      console.log("method", req.method);
      if (req.method === "GET") {
        return res.status(200).send(req.query.echostr);
      } else if (req.method === "POST") {
        const msg = (req.body.xml || req.body) as WxMsg.AllMsg;

        return wxMsgHandler.emit(msg, req, res);
      }
    } else {
      console.log("invalid request");
      res.success("非法请求");
    }
  });

  router.get("/users", async (_, res) => {
    res.success(await getUsers());
  });

  router.get("/autoReplyInfo", async (_, res) => {
    wxAutoReplyConfig = await getAutoReplyInfo();
    wxReplyHandler.onWxAutoReplyConfig(wxAutoReplyConfig);
    res.success(wxAutoReplyConfig);
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
