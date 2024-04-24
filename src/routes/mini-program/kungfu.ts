import { defineRouteHandler } from "../defineRouteHandler";
import { checkSignature } from "../../utils";

export const kungfuMPRouteHandler = defineRouteHandler(
  "/mp/kungfu",
  (router) => {
    router.all("/message", async (req, res) => {
      console.log("Received kungfu mp message");
      console.log("method", req.method);
      console.log("body", req.body);
      console.log("params", req.params);
      console.log("query", req.query);
      const result = checkSignature(req.query);
      res.send(result && req.query.echostr);
    });
  }
);
