export {};

declare global {
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
}
