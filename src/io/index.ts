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

const sendTemplateMsg = (openid: string) => {
  const data = {
    touser: openid,
    template_id: "ariEPkZ48zMxp90ACYUoJW4hocdvaTAEQfwhtapjzRI",
    miniprogram: {
      appid: "wx9bfff192f2941309",
    },
    topcolor: "#FF0000",
    data: {
      thing3: {
        value: "主力流入因子",
        color: "#173177",
      },
      thing4: {
        value: "功夫量化",
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

export { getUsers, getUserInfo, sendTemplateMsg };
