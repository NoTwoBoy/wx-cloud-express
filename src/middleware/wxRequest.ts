import { RequestHandler } from "express";

// 解析微信相关 id 中间件
const wxRequest: RequestHandler = (req, _, next) => {
  req.wxSource = req.headers["x-wx-source"] as string;

  if (req.wxSource) {
    req.wxOpenid = req.headers["x-wx-openid"] as string;
    req.wxUnionid = req.headers["x-wx-unionid"] as string;

    console.log("wx request", req.wxSource);
    console.log("wx openid", req.wxOpenid);
    console.log("wx unionid", req.wxUnionid);
  }

  next();
};

export default wxRequest;
