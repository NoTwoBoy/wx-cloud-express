import { Request, Response } from "express";

declare global {
  namespace Express {
    export interface Request {
      wxSource: string;
      wxOpenid: string;
      wxUnionid: string;
    }

    export interface Response {
      success: (data: any, statusCode?: number) => Response;
      error: (message: string, statusCode?: number) => Response;
    }
  }
}
