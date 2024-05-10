import axios from "axios";

// https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

const wxAxios = axios.create({
  baseURL: "http://api.weixin.qq.com",
  timeout: 5000,
});

wxAxios.interceptors.response.use((res) => {
  return res.data;
});

const { KUNGFU_OA_APPID, ACCESS_TOKEN } = process.env;

const getUsers = () => {
  return wxAxios
    .get(`/cgi-bin/user/get?from_appid=${KUNGFU_OA_APPID}`)
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
};

const getUserInfo = (openid: string) => {
  return wxAxios
    .get(`/cgi-bin/user/info?from_appid=${KUNGFU_OA_APPID}&openid=${openid}`)
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch();
};

const getAutoReplyInfo = () => {
  return wxAxios
    .get(`/cgi-bin/get_current_autoreply_info?from_appid=${KUNGFU_OA_APPID}`)
    .then((res) => {
      console.log(res);
      return res as unknown as WxAutoReply.Config;
    });
};

const sendMessage = (openid: string, message: WxSendMsg.AllSendMsg) => {
  return wxAxios
    .post(
      `/cgi-bin/message/custom/send${
        ACCESS_TOKEN ? `?access_token=${ACCESS_TOKEN}` : ""
      }`,
      {
        touser: openid,
        ...message,
      }
    )
    .then((res) => {
      console.log(res);
      return res;
    });
};

const sendFactorResult = (config: {
  openid: string;
  factorType: "featured" | "self";
  factorName: string;
  moduleName: string;
}) => {
  const { openid, factorType, factorName, moduleName } = config;
  const isFeatured = factorType === "featured";

  const data = {
    touser: openid,
    template_id: "ariEPkZ48zMxp90ACYUoJW4hocdvaTAEQfwhtapjzRI",
    miniprogram: {
      appid: "wx9bfff192f2941309",
      pagepath: `pages/factor/index?factorType=${
        isFeatured ? 0 : 1
      }&moduleName=${moduleName}`,
    },
    data: {
      thing3: {
        value: factorName,
      },
      thing4: {
        value: isFeatured ? "功夫精选" : "自研",
      },
    },
  };

  return wxAxios
    .post(`/cgi-bin/message/template/send?from_appid=${KUNGFU_OA_APPID}`, data)
    .then((res) => {
      console.log(res);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
};

export {
  getUsers,
  getUserInfo,
  getAutoReplyInfo,
  sendMessage,
  sendFactorResult,
};
