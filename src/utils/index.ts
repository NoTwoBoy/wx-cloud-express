import crypto from "crypto";
import express from "express";
import { TOKEN } from "../config";

export const checkSignature = (query: express.Request["query"]) => {
  const { nonce, signature, timestamp } = query;
  const sha1 = crypto.createHash("sha1");
  const str = [timestamp, nonce, TOKEN].sort().join("");
  sha1.update(str);
  const sha1str = sha1.digest("hex");
  console.log("sha1str", sha1str);
  return sha1str === signature;
};
