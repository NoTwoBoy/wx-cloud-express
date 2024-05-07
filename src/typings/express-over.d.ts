import { Request, Response } from "express";
import { PayloadInfo, ParsePayload } from "../middleware/payload";

declare global {
  namespace Express {
    export interface Request {
      wxSource?: string;
      wxOpenid?: string;
      wxUnionid?: string;

      payload: <T extends PayloadInfo>(
        payloadInfo: T
      ) => {
        valid: boolean;
        payload: ParsePayload<T>;
      };
    }

    export interface Response {
      success: (data: any, statusCode?: number) => Response;
      error: (message: string, statusCode?: number) => Response;
    }
  }
}
