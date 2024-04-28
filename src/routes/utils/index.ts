import { defineRouteHandler } from "../defineRouteHandler";

defineRouteHandler("/util", (router) => {
  // 小程序调用，获取微信 Open ID
  router.get("/api/wx_openid", async (req, res) => {
    if (req.wxSource) {
      console.log("wxSource", req.wxSource);
      console.log("wxOpenid", req.wxOpenid);
      console.log("wxUnionid", req.wxUnionid);
      res.success(req.wxOpenid);
    }
  });
});
