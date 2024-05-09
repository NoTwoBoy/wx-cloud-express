import { Response } from "express";
import xml2js from "xml2js";
import { sendMessage } from "../io";
import { asyncForEach, tryCatch } from "../utils";

export const useWxReply = () => {
  type ReplyCreation<T extends WxReply.AllReplyMsg> = Omit<
    T,
    "ToUserName" | "FromUserName" | "CreateTime"
  >;

  const keywordsReplies: Array<[RegExp, WxReply.AllReplyMsg[]]> = [];
  const onKeywords = (reg: RegExp, replies: WxReply.AllReplyMsg[]) => {
    keywordsReplies.push([reg, replies]);
  };

  let subscribeReplies: WxReply.AllReplyMsg[] = [];
  const onSubscribe = (replies: WxReply.AllReplyMsg[]) => {
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

  const buildReplyXml = (reply: Required<WxReply.AllReplyMsg>) => {
    const builder = new xml2js.Builder({
      rootName: "xml",
      headless: true,
    });
    return builder.buildObject(reply);
  };

  const replyByResponseXml = (
    res: Response,
    reply: Required<WxReply.AllReplyMsg>
  ) => {
    console.log("reply by response xml", reply);
    res.setHeader("Content-Type", "application/xml");
    return new Promise((resolve) => {
      res.send(buildReplyXml(reply)).end().once("finish", resolve);
    });
  };

  const reply2sendMsg = (reply: WxReply.AllReplyMsg): WxSendMsg.AllSendMsg => {
    switch (reply.MsgType) {
      case "text":
        return {
          msgtype: "text",
          text: {
            content: reply.Content,
          },
        };
      case "image":
        return {
          msgtype: "image",
          image: {
            media_id: reply.Image.MediaId,
          },
        };
      case "voice":
        return {
          msgtype: "voice",
          voice: {
            media_id: reply.Voice.MediaId,
          },
        };
      case "video":
        return {
          msgtype: "video",
          video: {
            media_id: reply.Video.MediaId,
          },
        };
      case "music":
        return {
          msgtype: "music",
          music: {
            title: reply.Music.Title,
            description: reply.Music.Description,
            musicurl: reply.Music.MusicURL,
            hqmusicurl: reply.Music.HQMusicUrl,
            thumb_media_id: reply.Music.ThumbMediaId,
          },
        };
      case "news":
        return {
          msgtype: "news",
          news: {
            articles: reply.Articles.item.map((item) => ({
              title: item.Title,
              description: item.Description,
              url: item.Url,
              picurl: item.PicUrl,
            })),
          },
        };
    }
  };

  const replyByCustomSend = (reply: Required<WxReply.AllReplyMsg>) => {
    console.log("reply by custom send", reply);
    return sendMessage(reply.ToUserName, reply2sendMsg(reply));
  };

  const reply = (res: Response, replies: Required<WxReply.AllReplyMsg>[]) => {
    if (replies.length === 0) return;
    if (replies.length === 1) {
      return replyByResponseXml(res, replies[0]);
    } else {
      return replyByResponseXml(res, replies[0]).then(() => {
        asyncForEach(replies.slice(1), (reply) => {
          return replyByCustomSend(reply);
        });
      });
    }
  };

  const triggerKeywordsReply = (res: Response, msg: WxMsg.TextMsg) => {
    const { Content } = msg;
    const baseReply = buildBaseReply(msg);
    for (const [reg, replies] of keywordsReplies) {
      if (reg.test(Content)) {
        return reply(
          res,
          replies.map(
            (reply) =>
              ({
                ...baseReply,
                ...reply,
              } as Required<WxReply.AllReplyMsg>)
          )
        );
      }
    }
  };

  const triggerSubscribeReply = (msg: WxMsg.AllMsg) => {
    const baseReply = buildBaseReply(msg);

    subscribeReplies.forEach((reply) => {
      const fullReply = {
        ...baseReply,
        ...reply,
      } as Required<WxReply.AllReplyMsg>;

      replyByCustomSend(fullReply);
    });
  };

  const triggerReply = (msg: WxMsg.AllMsg, res: Response) => {
    switch (msg.MsgType) {
      case "text":
        return triggerKeywordsReply(res, msg);
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
    triggerKeywordsReply,
    triggerSubscribeReply,
  };
};
