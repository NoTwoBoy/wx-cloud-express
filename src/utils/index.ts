import crypto from "crypto";
import express from "express";
import { TOKEN } from "../config";

export const checkSignature = (query: express.Request["query"]) => {
  const { nonce, signature, timestamp } = query;
  const sha1 = crypto.createHash("sha1");
  const str = [timestamp, nonce, TOKEN].sort().join("");
  sha1.update(str);
  const sha1str = sha1.digest("hex");
  return sha1str === signature;
};

export function tryCatch<T extends (...args: any[]) => any>(fn: T) {
  return function (
    ...args: Parameters<T>
  ): [null, ReturnType<T>] | [Error, null] {
    try {
      const result = fn(...args) as ReturnType<T>;
      return [null, result];
    } catch (err) {
      return [err as Error, null];
    }
  };
}

export async function tryAwait<T, U = Error>(
  promise: Promise<T>
): Promise<[U, undefined] | [null, T]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, undefined]>((err: U) => {
      return [err, undefined];
    });
}
