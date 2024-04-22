import { Response } from "express";

declare global {
  namespace Express {
    // 扩展Response接口
    export interface Response {
      success: (data: any, statusCode?: number) => void;
      error: (message: string, statusCode?: number) => void;
    }
  }
}
