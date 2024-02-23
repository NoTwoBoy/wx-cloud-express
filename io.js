const axios = require("axios").default;

// https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

const wxAxios = axios.create({
  baseURL: "http://api.weixin.qq.com",
  timeout: 5000,
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

const getUserInfo = (openid) => {
  return wxAxios
    .get(`/cgi-bin/user/info?openid=${openid}`)
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch();
};

const sendTemplateMsg = (openid) => {
  const data = {
    touser: openid,
    template_id: "ariEPkZ48zMxp90ACYUoJW4hocdvaTAEQfwhtapjzRI",
    miniprogram: {
      appid: "wx900c368579e941a8",
      pagepath: "/pages/home/index",
    },
    topcolor: "#FF0000",
    data: {
      "thing3.DATA": {
        value: "主力流入因子",
        color: "#173177",
      },
      "thing4.DATA": {
        value: "天山算力",
      },
    },
  };

  return wxAxios
    .post(`/cgi-bin/message/template/send?from_appid=wxb02d4dc9dd5c610b`, data)
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = {
  getUsers,
  getUserInfo,
  sendTemplateMsg,
};
