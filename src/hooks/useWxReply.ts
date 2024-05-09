import { Response } from "express";
import xml2js from "xml2js";

export const useWxReply = () => {
  type ReplyCreation<T extends WxReply.AllReplyMsg> = Omit<
    T,
    "ToUserName" | "FromUserName" | "CreateTime"
  >;

  const keywordsReplies: Array<[RegExp, ReplyCreation<WxReply.AllReplyMsg>[]]> =
    [];
  const onKeywords = (
    reg: RegExp,
    replies: ReplyCreation<WxReply.AllReplyMsg>[]
  ) => {
    keywordsReplies.push([reg, replies]);
  };

  let subscribeReplies: ReplyCreation<WxReply.AllReplyMsg>[] = [];
  const onSubscribe = (replies: ReplyCreation<WxReply.AllReplyMsg>[]) => {
    subscribeReplies = replies;
  };

  const buildBaseReply = (msg: WxMsg.AllMsg) => {
    const { ToUserName, FromUserName } = msg;
    return {
      ToUserName: FromUserName,
      FromUserName: ToUserName,
      CreateTime: Math.floor(Date.now() / 1000),
    };
  };

  const buildReplyXml = (reply: WxReply.AllReplyMsg) => {
    const builder = new xml2js.Builder();
    return builder.buildObject(reply);
  };

  const triggerKeywordsReply = (msg: WxMsg.TextMsg) => {
    const { Content } = msg;
    const baseReply = buildBaseReply(msg);
    for (const [reg, replies] of keywordsReplies) {
      if (reg.test(Content)) {
        return replies[0];
      }
    }
  };

  const triggerSubscribeReply = (msg: WxMsg.AllMsg) => {
    return subscribeReplies;
  };

  const triggerReply = (msg: WxMsg.AllMsg, res: Response) => {
    switch (msg.MsgType) {
      case "text":
        return triggerKeywordsReply(msg);
      case "event":
        if (msg.Event === "subscribe") {
          return triggerSubscribeReply(msg);
        }
    }
  };

  return {
    onKeywords,
    onSubscribe,
    triggerReply,
  };
};
