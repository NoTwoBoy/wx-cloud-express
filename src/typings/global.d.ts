export {};

declare global {
  type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

  namespace WxMsg {
    type MsgType =
      | "text"
      | "event"
      | "image"
      | "voice"
      | "video"
      | "location"
      | "link"
      | "miniprogrampage";
    interface BaseMsg<T extends MsgType = MsgType> {
      ToUserName: string;
      FromUserName: string;
      CreateTime: number;
      MsgType: T;
    }

    type Event =
      | "subscribe"
      | "unsubscribe"
      | "SCAN"
      | "LOCATION"
      | "CLICK"
      | "VIEW";
    interface BaseEventMsg<T extends Event> extends BaseMsg<"event"> {
      Event: T;
    }

    interface SubscribeEventMsg extends BaseEventMsg<"subscribe"> {}
    interface UnsubscribeEventMsg extends BaseEventMsg<"unsubscribe"> {}
    interface ScanEventMsg extends BaseEventMsg<"SCAN"> {
      EventKey: string;
      Ticket: string;
    }
    interface LocationEventMsg extends BaseEventMsg<"LOCATION"> {
      Latitude: number;
      Longitude: number;
      Precision: number;
    }
    interface ClickEventMsg extends BaseEventMsg<"CLICK"> {
      EventKey: string;
    }
    interface ViewEventMsg extends BaseEventMsg<"VIEW"> {
      EventKey: string;
    }

    type AllEventMsg =
      | SubscribeEventMsg
      | UnsubscribeEventMsg
      | ScanEventMsg
      | LocationEventMsg
      | ClickEventMsg
      | ViewEventMsg;

    interface TextMsg extends BaseMsg<"text"> {
      Content: string;
      MsgId: string;
      MsgDataId: string;
      Idx: string;
    }

    type AllMsg = TextMsg | AllEventMsg;
  }

  namespace WxReply {
    type ReplyMsgType = "text" | "image" | "voice" | "video" | "music" | "news";

    interface BaseReplyMsg<T extends ReplyMsgType = ReplyMsgType> {
      ToUserName?: string;
      FromUserName?: string;
      CreateTime?: number;
      MsgType: T;
    }

    interface TextReplyMsg extends BaseReplyMsg<"text"> {
      Content: string;
    }

    interface Image {
      MediaId: string;
    }

    interface ImageReplyMsg extends BaseReplyMsg<"image"> {
      Image: Image;
    }

    interface Voice {
      MediaId: string;
    }

    interface VoiceReplyMsg extends BaseReplyMsg<"voice"> {
      Voice: Voice;
    }

    interface Video {
      MediaId: string;
      Title: string;
      Description: string;
    }

    interface VideoReplyMsg extends BaseReplyMsg<"video"> {
      Video: Video;
    }

    interface Music {
      Title: string;
      Description: string;
      MusicURL: string;
      HQMusicUrl: string;
      ThumbMediaId: string;
    }
    interface MusicReplyMsg extends BaseReplyMsg<"music"> {
      Music: Music;
    }

    interface Article {
      Title: string;
      Description: string;
      PicUrl: string;
      Url: string;
    }

    interface NewsReplyMsg extends BaseReplyMsg<"news"> {
      ArticleCount: number;
      Articles: { item: WxReply.Article[] };
    }

    type AllReplyMsg =
      | TextReplyMsg
      | ImageReplyMsg
      | VoiceReplyMsg
      | VideoReplyMsg
      | MusicReplyMsg
      | NewsReplyMsg;
  }

  namespace WxSendMsg {
    type SendMsgType = "text" | "image" | "voice" | "video" | "music" | "news";

    interface BaseSendMsg<T extends SendMsgType = SendMsgType> {
      msgtype: T;
    }

    interface TextSendMsg extends BaseSendMsg<"text"> {
      text: {
        content: string;
      };
    }

    interface ImageSendMsg extends BaseSendMsg<"image"> {
      image: {
        media_id: string;
      };
    }

    interface VoiceSendMsg extends BaseSendMsg<"voice"> {
      voice: {
        media_id: string;
      };
    }

    interface VideoSendMsg extends BaseSendMsg<"video"> {
      video: {
        media_id: string;
        thumb_media_id?: string;
        title?: string;
        description?: string;
      };
    }

    interface MusicSendMsg extends BaseSendMsg<"music"> {
      music: {
        title: string;
        description: string;
        musicurl: string;
        hqmusicurl: string;
        thumb_media_id: string;
      };
    }

    interface Article {
      title: string;
      description: string;
      url: string;
      picurl: string;
    }

    interface NewsSendMsg extends BaseSendMsg<"news"> {
      news: {
        articles: Article[];
      };
    }

    type AllSendMsg =
      | TextSendMsg
      | ImageSendMsg
      | VoiceSendMsg
      | VideoSendMsg
      | MusicSendMsg
      | NewsSendMsg;
  }
}
