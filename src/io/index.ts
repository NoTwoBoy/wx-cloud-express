import axios from "axios";

// https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

const wxAxios = axios.create({
  baseURL: "http://api.weixin.qq.com",
  timeout: 5000,
});

wxAxios.interceptors.response.use((res) => {
  return res.data;
});

const getUsers = () => {
  return wxAxios
    .get(`/cgi-bin/user/get?from_appid=wxb02d4dc9dd5c610b`)
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
    .get(`/cgi-bin/user/info?from_appid=wxb02d4dc9dd5c610b&openid=${openid}`)
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch();
};

const sendMessage = (openid: string, message: any) => {
  return wxAxios.post(`/cgi-bin/message/custom/send`, {
    touser: openid,
    ...message,
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
    .post(`/cgi-bin/message/template/send?from_appid=wxb02d4dc9dd5c610b`, data)
    .then((res) => {
      console.log(res);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
};

export { getUsers, getUserInfo, sendMessage, sendFactorResult };
