import { defineRouteHandler } from "../defineRouteHandler";
import { checkSignature } from "../../utils";

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

  router.post("/subscribe", (req, res) => {
    console.log("req.wxOpenid", req.wxOpenid);
    console.log("req.wxUnionid", req.wxUnionid);
    console.log("req.wxSource", req.wxSource);
    console.log("req.params", req.params);
    console.log("req.query", req.query);
    console.log("req.body", req.body);
    res.success(null);
  });
});
