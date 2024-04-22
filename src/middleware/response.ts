import { RequestHandler } from "express";

// 自定义响应结构中间件
const responseMiddleware: RequestHandler = (_, res, next) => {
  /**
   * 发送自定义成功响应
   * @param {any} data - 要发送的数据
   * @param {number} [statusCode] - 响应状态码
   */
  res.success = (data, statusCode) => {
    res.status(statusCode || 200).json({
      success: true,
      data: data,
    });
  };

  /**
   * 发送自定义错误响应
   * @param {string} message - 错误消息
   * @param {number} [statusCode] - 响应状态码
   */
  res.error = (message, statusCode) => {
    res.status(statusCode || 500).json({
      success: false,
      message: message,
    });
  };

  next();
};

export default responseMiddleware;
