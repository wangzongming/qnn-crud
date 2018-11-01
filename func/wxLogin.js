const https = require("https");

const wxLoginFn = (config = {}) => {
  return new Promise(resolve => {
    https
      .get(
        `https://api.weixin.qq.com/sns/jscode2session?appid=${
          config.appId
        }&secret=${config.appSecret}&js_code=${
          config.code
        }&grant_type=authorization_code`,
        res => {
          res.on("data", d => {
            const strData = d + "";
            const _data = JSON.parse(strData);
            let _res = {
              success: true,
              data: {
                ..._data
              }
            };
            if (_res.data.errcode) {
              resolve({
                success: false,
                message: `登录失败：${_res.data.errcode}`
              });
            } else {
              // {"session_key":"IspXjigQZ4tv0YeMijOIWA==","openid":"oMGS45UOmnL6Ml-HZ-SQqEEV1dW8"}
              resolve(_res);
              return _res;
            }
          });
        }
      )
      .on("error", e => {
        let _res = {
          success: false,
          data: e,
          message: "登录失败"
        };
        resolve({ ..._res });
        return _res;
      });
  });
};

export default wxLoginFn;
