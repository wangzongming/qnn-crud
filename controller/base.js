// const isDev = think.env === "development";

module.exports = class extends think.Controller {
    async __before() {
        const method = this.method.toLowerCase(); // 获取当前请求类型

        this.header({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers":
                "X-Requested-With,Origin,Content-Type,Accept,token",
            "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS"
        }); //设置 header
        // this.ctx.isPost
        //设置头跨域
        if (method === "options") {
            this.ctx.body = {};
            return false;
        } else if (method === "post") {
            //验证token
            let _next = true;
            const url = this.ctx.url;
            //满足这些条件时不验证token
            const unless =
                url === "/adminUser/login" ||
                url === "/user/wxLogin" ||
                url === "/wx/notify" ||
                url === "/banner/list" ||
                url === "/bookRecommend/list" ||
                url === "/classify/list" ||
                url === "/schoolbag/list" ||
                url === "/option/list" ||
                url === "/tag/list" ||
                url === "/option/list" ||
                url === "/book/list" ||
                url === "/visitHistory/add";


            const token = this.ctx.header.token;
            if (!unless) {
                // && !isDev
                _next = false;
                if (!token) {
                    this.ctx.body = {
                        success: false,
                        message: "token不能为空",
                        code: think.errCode.reLogin
                    };
                    _next = false;
                    return false;
                }

                //验证权限 权限不足时 自动取消执行
                //...待实现 
                await think.verifyToken(token,this.ctx).then(payload => {
                    //荷载存在并且不能等于false 
                    if (payload && (payload !== false || payload !== "false")) {
                        if (this.ctx.state && think.isObject(this.ctx.state)) {
                            this.ctx.state = { ...this.ctx.state,...payload };
                        } else {
                            this.ctx.state = { ...payload };
                        }
                        _next = true;
                    } else {
                        _next = false;
                    }
                });
            } else if(token) {
                //虽然不验证token但是某些接口依然需要要有用户信息 没有也不能报错  必须书本列表需要用户信息查询已借阅和未借阅
                await think.verifyToken(token,this.ctx).then(payload => {
                    //荷载存在并且不能等于false 
                    if (payload && (payload !== false || payload !== "false")) {
                        if (this.ctx.state && think.isObject(this.ctx.state)) {
                            this.ctx.state = { ...this.ctx.state,...payload };
                        } else {
                            this.ctx.state = { ...payload };
                        }
                    }
                });
            }

            return _next;
        } else {
            this.ctx.body = {
                success: false,
                message: "只能使用post请求"
            };
            return false;
        }
    }
};
