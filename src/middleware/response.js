// 自定义响应结构中间件
function responseMiddleware(req, res, next) {
  // 保存原始的res.send函数引用
  const originalSend = res.send;

  // 重写res.send函数
  res.send = function (body) {
    // 设置自定义响应结构
    let responseStructure = {
      code: 200,
      status: "success",
      data: body,
    };

    // 如果发生错误，可以在这里改变响应结构
    if (res.statusCode >= 400) {
      responseStructure = {
        code: res.statusCode,
        status: "error",
        message: body,
      };
    }

    // 调用原始的res.send函数
    originalSend.call(this, responseStructure);
  };

  next();
}

module.exports = responseMiddleware;
