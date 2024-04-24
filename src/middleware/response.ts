import { RequestHandler } from "express";

// 自定义响应结构中间件
const responseMiddleware: RequestHandler = (_, res, next) => {
  /**
   * 发送自定义成功响应
   * @param {any} data - 要发送的数据
   * @param {number} [statusCode] - 响应状态码
   */
  res.success = (data: any, statusCode: number = 200) => {
    return res.status(statusCode).json({
      code: statusCode || 200,
      success: true,
      data: data,
    });
  };

  /**
   * 发送自定义错误响应
   * @param {string} message - 错误消息
   * @param {number} [statusCode] - 响应状态码
   */
  res.error = (message: string, statusCode: number = 500) => {
    return res.status(statusCode).json({
      code: statusCode || 500,
      success: false,
      message: message,
    });
  };

  next();
};

export default responseMiddleware;
