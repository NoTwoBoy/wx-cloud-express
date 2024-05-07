import { Request, Response, RequestHandler } from "express";

export type PayloadInfo = {
  [key: string]: {
    type:
      | StringConstructor
      | NumberConstructor
      | BooleanConstructor
      | ArrayConstructor
      | ObjectConstructor
      | Array<any>;
    required?: boolean;
  };
};

type ArrayItems<T> = T extends Array<any> ? T[number] : T;

type TypeWrapper<T> = T extends (...args: any) => any
  ? ReturnType<T>
  : ArrayItems<T>;

export type ParsePayload<T extends PayloadInfo> = {
  [key in keyof T as T[key]["required"] extends true
    ? key
    : never]: TypeWrapper<T[key]["type"]>;
} & {
  [key in keyof T as T[key]["required"] extends true
    ? never
    : key]?: TypeWrapper<T[key]["type"]>;
};

const checkPayload = <T extends PayloadInfo>(
  payloadInfo: T,
  req: Request,
  res: Response
): { valid: boolean; payload: ParsePayload<T> } => {
  const payload = req.method === "GET" ? req.query : req.body;

  console.log("payload", payload);

  for (const key in payloadInfo) {
    const info = payloadInfo[key];
    const value = payload[key];

    const checkValue = () => {
      if (Array.isArray(info.type)) {
        if (!info.type.includes(value)) {
          res.error(`${key} must be one of ${info.type.join(",")}`);
          return false;
        }
      } else if (!(value instanceof info.type)) {
        res.error(`${key} must be ${info.type.name}`);
        return false;
      }

      return true;
    };

    if (info.required) {
      if (!value) {
        res.error(`${key} is required`);
        return {
          valid: false,
          payload,
        };
      }

      if (!checkValue()) {
        return {
          valid: false,
          payload,
        };
      }
    } else {
      if (value) {
        if (!checkValue()) {
          return {
            valid: false,
            payload,
          };
        }
      }
    }
  }

  return {
    valid: true,
    payload,
  };
};

// 自定义响应结构中间件
const payloadMiddleware: RequestHandler = (req, res, next) => {
  req.payload = <T extends PayloadInfo>(payloadInfo: T) => {
    return checkPayload(payloadInfo, req, res);
  };

  next();
};

export default payloadMiddleware;
