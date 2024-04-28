import { defineRouteHandler } from "../defineRouteHandler";
import { checkSignature, tryAwait } from "../../utils";
import { syncUser } from "../../db/user";

defineRouteHandler("/mp/kungfu", (router) => {
  router.all("/message", async (req, res) => {
    console.log("Received kungfu mp message");
    console.log("method", req.method);
    console.log("body", req.body);
    console.log("params", req.params);
    console.log("query", req.query);
    const result = checkSignature(req.query);
    res.send(result && req.query.echostr);
  });

  router.post("/subscribe", async (req, res) => {
    console.log("req.wxOpenid", req.wxOpenid);
    console.log("req.wxUnionid", req.wxUnionid);
    console.log("req.wxSource", req.wxSource);
    console.log("req.params", req.params);
    console.log("req.query", req.query);
    console.log("req.body", req.body);

    if (req.wxUnionid) {
      const [err, user] = await tryAwait(
        syncUser(
          {
            wx_unionid: req.wxUnionid,
          },
          {
            kf_mp_openid: req.wxOpenid,
            subscribed_factor: true,
          }
        )
      );

      if (user) {
        res.success(user);
      } else {
        res.error(err.message);
      }
    }
  });
});
