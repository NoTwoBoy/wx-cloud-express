import { Request, Response } from "express";

export const useWxMsg = () => {
  type EventMsgMap = {
    subscribe: WxMsg.SubscribeEventMsg;
    unsubscribe: WxMsg.UnsubscribeEventMsg;
    VIEW: WxMsg.ViewEventMsg;
    CLICK: WxMsg.ClickEventMsg;
    SCAN: WxMsg.ScanEventMsg;
    LOCATION: WxMsg.LocationEventMsg;
  };

  type MsgKey = `${WxMsg.MsgType}` | `event.${keyof EventMsgMap}`;
  type MsgCallback<T extends MsgKey = MsgKey> = (
    msg: T extends `event.${infer E extends keyof EventMsgMap}`
      ? EventMsgMap[E]
      : T extends "text"
      ? WxMsg.TextMsg
      : null,
    req: Request,
    res: Response
  ) => void;
  const msgTypeListeners: Record<string, MsgCallback> = {};

  const emit = (msg: WxMsg.AllMsg, req: Request, res: Response) => {
    if (!msgTypeListeners[msg.MsgType]) return;

    const msgKeyCompose =
      msg.MsgType === "event" ? `${msg.MsgType}.${msg.Event}` : msg.MsgType;

    msgTypeListeners[msgKeyCompose](msg, req, res);
  };

  const on = <T extends MsgKey>(msgType: T, cb: MsgCallback<MsgKey>) => {
    if (msgTypeListeners[msgType])
      return console.error(`MsgType ${msgType} already exists`);

    msgTypeListeners[msgType] = cb;
  };

  return {
    emit,
    on,
  };
};
