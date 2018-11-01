//数据库基本增删改查操作  全部方法异步
const table = {
  async add({
    ctx, // *必传
    dbTable, //表 *必传
    keyId = "id", //主键id     ps：非驼峰
    rules = [], //数据操作规则
    dbTableFiles, //附件表   ps：非驼峰
    filesField, //附件参数字段   ps：必须传入驼峰
    onlyKey, //唯一数据，如果新增数据存在在新增数据时表里存在该数据就无法新增  ps：必须传入驼峰
    onlyKeyCb, //如果数据存在可以传入一个回调 该方法接受一个查询到的数据 应该returtn一个 {success, data, message}
    paramsHand, //参数处理 此时参数已经去掉success等情况下才执行才方法  *ps：该方法必须是异步函数
    otherParams = [] //可选 create_time create_user
  }) {
    onlyKey = think.snakeCase(onlyKey);
    if (think.isEmpty(ctx) || think.isEmpty(dbTable)) {
      think.logger.error("ctx对象和dbTable为必传  ---oldWang");
      return;
    }
    try {
      let params = "";
      if (think.isEmpty) {
        params = await think.newParams(ctx);
      } else {
        params = await think.newParams(ctx, rules);
      }
      if (think.isObject(params) && !think.isEmpty(params) && !params.success) {
        //参数错误 会自动提示的
        return;
      }

      if (think.isObject(params)) {
        //参数正确切参数为对象时 需要将参数处理为正确的格式
        delete params.success; //succeess是内置字段前端不能传入后端也不能使用
        //创建主键
        if (!params[keyId]) {
          params[keyId] = think.createUid();
        }
      }
 
      //增加创建者
      if (otherParams.includes("create_user")) {
        params.create_user = ctx.state.uid;
      }
      //增加创建者id
      if (otherParams.includes("create_user_name")) {
        params.create_user_id = ctx.state.username;
      }
      //增加创建时间
      if (otherParams.includes("create_time")) {
        params.create_time = new Date().getTime();
      }
      //增加分馆 是根据操作者token区分的
      if (otherParams.includes("branch")) {
        params.branch = ctx.state.branch;
      }

      if (paramsHand) {
        params = await paramsHand(params);
      }
      
      //有附件的话将附件存起来
      if (
        dbTableFiles &&
        params[filesField] &&
        think.isArray(params[filesField])
      ) {
        //附件表存需要插入附件
        params[filesField] = params[filesField].map(item => {
          //设置主键
          item[keyId] = params[keyId];
          return item;
        });

        const modelf = think.model(dbTableFiles);
        await modelf.addMany(params[filesField]);
      }

      const model = think.model(dbTable);

      //判断是否判断某字段重复性
      if (onlyKey && think.isObject(params)) {
        //验证是否可以新增
        let _d = await model.where({ [onlyKey]: params[onlyKey] }).find();
        if (!think.isEmpty(_d)) {
          let res = {};
          if (onlyKeyCb) {
            res = onlyKeyCb(_d);
          } else {
            res = {
              data: "",
              success: false,
              message: `（${_d[onlyKey]}）该数据已存在请勿重复添加`
            };
          }
          ctx.body = res;
          return;
        }
      }

      //暂时新增数据时参数只能是一个对象
      let data = {};
      if (think.isObject(params)) {
        //参数正确切参数为对象时 需要将参数处理为正确的格式
        data = await model.add({
          [keyId]: think.createUid(),
          ...params
        });
      } else {
        think.logger.error("传入参数不是一个object，无法添加数据  ---oldWang");
        return;
      }

      ctx.body = think.addRes(data, params);
    } catch (err) {
      think.sysErr(err, ctx);
    }
  },
  //删除数据
  async del({
    ctx,
    dbTable, //表 *必传
    keyId = "id", //主键id     ps：非驼峰
    rules = [], //数据操作规则 
    dbTableFiles //附件表   ps：非驼峰
  }) {
    if (think.isEmpty(ctx) || think.isEmpty(dbTable)) {
      think.logger.error("ctx对象和dbTable为必传  ---oldWang");
      return;
    }
    try {
      let params = "";
      if (think.isEmpty) {
        params = await think.newParams(ctx);
      } else {
        params = await think.newParams(ctx, rules);
      }
      await think.batchDel({
        ctx,
        tableName: dbTable,
        delData: params,
        key: keyId,
        dbTableFiles: {
          attacKey: keyId,
          attacTableName: dbTableFiles
        }
      });
    } catch (err) {
      think.sysErr(err, ctx);
    }
  },
  //数据查询
  async list({
    ctx,
    dbTable, //表 *必传
    keyId = "id", //主键id     ps：非驼峰
    rules = [], //数据操作规则
    fieldName, //查询时附件表 实现功能类似于sql全联查询
    sort = {}, //排序
    isLike = true, //是否使用like检索
    dbTableFiles, //附件表   ps：非驼峰
    paramsHand, //查询参数处理 必须为异步函数
    dataHand, //查询出来的数据处理函数 必须为异步函数
    //以下全部为驼峰写法
    relationTable, //incBook 关系表
    relationTableKey = "id", //从表关联主表的主键
    relationTableChildren = "id", // 关系表主键 ps：驼峰
    relationTableChildrenFilesTableName, // = "all_book_files"; //从表的附件表表名
    relationTableChildrenFilesField, // "images"; //从表的附件表附件字段名  前台需要的并不数据库里的
    relationTableChildrenFilesKey = "id", // "id"; //从表的附件表的主键
    relationTableChildrenFilesFieldId = "id" // = "id"; //从表的附件表字段名(关联的字段)
  }) {
    if (think.isEmpty(ctx) || think.isEmpty(dbTable)) {
      think.logger.error("ctx对象和dbTable为必传  ---oldWang");
      return;
    }

    try {
      //附件表情况下查询时需要查附件表
      let params = "";
      if (think.isEmpty) {
        params = await think.newParams(ctx);
      } else {
        params = await think.newParams(ctx, rules);
      }

      if (paramsHand) {
        params = await paramsHand(params);
      }

      let { data, totalNumber } = await think.select(
        dbTable,
        params,
        dbTableFiles,
        [keyId, keyId],
        fieldName,
        sort,
        isLike
      ); //最后还可传入isLike bool

      //需要将从表数据查出
      if (relationTable && relationTableChildren && !think.isEmpty(data)) {
        const tableConfig = {
          //主表配置
          childrenKey: relationTableChildren
        };
        const childrenConfig = {
          //从表配置
          tableName: relationTable,
          key: relationTableKey,
          relationTableChildrenFilesTableName,
          relationTableChildrenFilesKey,
          relationTableChildrenFilesField,
          relationTableChildrenFilesFieldId
        };
        data = await think.getTableChildren(data, tableConfig, childrenConfig);
      }
      //如果dataHand函数存在即会特殊处理一遍从数据库中拿到的数据，dataHand函数必须为异步函数且返回值为客户端数据
      if (dataHand) {
        data = await dataHand(data);
      }

      ctx.body = {
        message: "查询成功",
        success: true,
        data: data,
        totalNumber: totalNumber
      };
    } catch (err) {
      think.sysErr(err, ctx);
    }
  },
  //数据修改
  async update({
    ctx,
    filesField,
    dbTable, //表 *必传
    keyId = "id", //主键id     ps：非驼峰
    rules = [], //数据操作规则
    dbTableFiles, //附件表   ps：非驼峰
    paramsHand //改变参数时特殊处理 此时参数已经去掉success等情况下才执行才方法  *ps：该方法必须是异步函数\
  }) {
    try {
      let params = await think.newParams(ctx, rules);
      if (!think.isObject(params)) {
        ctx.body = {
          message: "数据格式为jsonObject，其他格式无效!",
          success: false,
          data: ""
        };
        return;
      }
      if (params.success) {
        delete params.success;
        if (paramsHand) {
          params = await paramsHand(params);
        }

        //有附件得更新所有附件附件
        if (
          dbTableFiles &&
          params[filesField] &&
          think.isArray(params[filesField])
        ) {
          const modelf = think.model(dbTableFiles);
          params[filesField] = params[filesField].map(item => {
            //设置主键
            item.thumbnail = item["thumbnail"] || ""; //兼容旧版框架处理
            item[keyId] = params[keyId];
            return item;
          });
          //先删后增
          await modelf.where({ [keyId]: params[keyId] }).delete();
          if (!think.isEmpty(params[filesField])) {
            await modelf.addMany(params[filesField]);
          }
        }

        const model = think.model(dbTable);
        const data = await model.where({ [keyId]: params[keyId] }).update({
          ...params
        });
        ctx.body = think.updateRes(data);
      }
    } catch (err) {
      think.sysErr(err, ctx);
    }
  }
};
export default table;
