import { defineRouteHandler } from "../defineRouteHandler";

defineRouteHandler("/util", (router) => {
  router.get("/openid", async (req, res) => {
    if (req.wxSource) {
      console.log("wxSource", req.wxSource);
      console.log("wxOpenid", req.wxOpenid);
      console.log("wxUnionid", req.wxUnionid);
      res.success({
        openid: req.wxOpenid,
        unionid: req.wxUnionid,
      });
    }
  });
});
