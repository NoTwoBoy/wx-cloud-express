import { Response } from "express";
import xml2js from "xml2js";
import { sendMessage } from "../io";
import { asyncForEach, tryCatch } from "../utils";

export const useWxReply = () => {
  type ReplyCreation<T extends WxReply.AllReplyMsg> = Omit<
    T,
    "ToUserName" | "FromUserName" | "CreateTime"
  >;

  const keywordsReplies: Array<{
    regExps: RegExp[];
    replies: WxReply.AllReplyMsg[];
    config: WxReply.ReplyConfig;
  }> = [];
  const onKeywords = (
    regExps: RegExp[],
    replies: WxReply.AllReplyMsg[],
    config?: WxReply.ReplyConfig
  ) => {
    config = {
      replyMode: config?.replyMode || "reply_all",
    } || { replyMode: "reply_all" };

    keywordsReplies.push({ regExps, replies, config });
  };

  let subscribeReplies: WxReply.AllReplyMsg[] = [];
  const onSubscribe = (replies: WxReply.AllReplyMsg[]) => {
    if (subscribeReplies.length) return;
    subscribeReplies = replies;
  };

  let defaultReplies: WxReply.AllReplyMsg[] = [];
  const onDefault = (replies: WxReply.AllReplyMsg[]) => {
    if (defaultReplies.length) return;
    defaultReplies = replies;
  };

  const wxReplyInfo2ReplyMsg = (
    info: WxAutoReply.ReplyInfo
  ): WxReply.AllReplyMsg => {
    switch (info.type) {
      case "text":
        return {
          MsgType: "text",
          Content: info.content,
        };
      case "img":
        return {
          MsgType: "image",
          Image: {
            MediaId: info.content,
          },
        };
      case "voice":
        return {
          MsgType: "voice",
          Voice: {
            MediaId: info.content,
          },
        };
      case "video":
        return {
          MsgType: "video",
          Video: {
            MediaId: info.content,
            Title: "",
            Description: "",
          },
        };
      case "news":
        return {
          MsgType: "news",
          ArticleCount: info.news_info.list.length,
          Articles: {
            item: info.news_info.list.map((item) => ({
              Title: item.title,
              Description: item.digest,
              PicUrl: item.cover_url,
              Url: item.content_url,
            })),
          },
        };
    }
  };

  const keywordInfo2RegExp = (info: WxAutoReply.KeywordInfo): RegExp => {
    const { match_mode, content } = info;
    switch (match_mode) {
      case "equal":
        return new RegExp(`^${content}$`);
      case "contain":
        return new RegExp(content);
    }
  };

  const onWxAutoReplyConfig = (config: WxAutoReply.Config) => {
    const {
      is_add_friend_reply_open,
      add_friend_autoreply_info,
      is_autoreply_open,
      keyword_autoreply_info,
      message_default_autoreply_info,
    } = config;
    if (is_add_friend_reply_open && add_friend_autoreply_info) {
      onSubscribe([wxReplyInfo2ReplyMsg(add_friend_autoreply_info)]);
    }
    if (is_autoreply_open) {
      keyword_autoreply_info?.list.forEach((item) => {
        const { keyword_list_info, reply_list_info, reply_mode } = item;
        onKeywords(
          keyword_list_info.map(keywordInfo2RegExp),
          reply_list_info.map(wxReplyInfo2ReplyMsg),
          { replyMode: reply_mode }
        );
      });

      message_default_autoreply_info &&
        onDefault([wxReplyInfo2ReplyMsg(message_default_autoreply_info)]);
    }
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
    const xml = buildReplyXml(reply);
    function escapeHtml(text: string) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
    console.log(
      `reply by response xml \n <pre><code>${escapeHtml(xml)}</code></pre>`
    );

    return new Promise((resolve) => {
      res
        .header("Content-Type", "text/xml")
        .send(xml)
        .end()
        .once("finish", resolve);
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
    for (const { regExps, replies, config } of keywordsReplies) {
      if (regExps.some((regExp) => regExp.test(Content))) {
        const r =
          config.replyMode === "random_one"
            ? [replies[Math.floor(Math.random() * replies.length)]]
            : replies;
        return reply(
          res,
          r.map(
            (reply) =>
              ({
                ...baseReply,
                ...reply,
              } as Required<WxReply.AllReplyMsg>)
          )
        );
      }
    }

    const replies = defaultReplies.map(
      (reply) =>
        ({
          ...baseReply,
          ...reply,
        } as Required<WxReply.AllReplyMsg>)
    );
    return reply(res, replies);
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
    onWxAutoReplyConfig,
    triggerReply,
    triggerKeywordsReply,
    triggerSubscribeReply,
  };
};
