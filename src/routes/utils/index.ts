import { defineRouteHandler } from "../defineRouteHandler";
import { Counter } from "../../db";

defineRouteHandler("/util", (router) => {
  router.post("/api/count", async (req, res) => {
    const { action } = req.body;
    if (action === "inc") {
      await Counter.create();
    } else if (action === "clear") {
      await Counter.destroy({
        truncate: true,
      });
    }
    res.success(await Counter.count());
  });

  // 更新计数
  router.post("/api/count", async (req, res) => {
    const { action } = req.body;
    if (action === "inc") {
      await Counter.create();
    } else if (action === "clear") {
      await Counter.destroy({
        truncate: true,
      });
    }
    res.success(await Counter.count());
  });

  // 获取计数
  router.get("/api/count", async (req, res) => {
    const result = await Counter.count();
    res.success(result);
  });

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
