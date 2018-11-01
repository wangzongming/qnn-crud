### qnn-crud(v0.0.1) 内测中(整理中)...

- 开箱即用
- 不是很特殊的接口只需配置

thinkjs(框架底层基于 Koa 2.x 实现) + mysql 实现的增删改查 api 接口
使用 jwt 将前后端完全分离

#### 简介

灵活的数据库增删改成方法封装，只需要调用方法->传入数据库表配置->即可生成对应表的增删改查接口
前端可使用 qnn-table 完美配合 https://github.com/wangzongming/qnn-table

#### 调用方法
    
    接口-add：
    async addAction() {
        await table.add({
            rules: add,//参数规则定义
            ctx: this.ctx,
            keyId,//数据主键
            dbTable,//数据库
            dbTableFiles,//附件表
            filesField,//附件字段
            paramsHand:async function(){}, //参数特殊处理
            onlyKey: "", //: "classify_name", //唯一主键
            otherParams: [] //: ["create_time"] //往数据中额外加入的参数
        });

    }

    接口-delete:sss
    async delAction() {
        await table.del({
        filesField,
        ctx: this.ctx,
        rules: del, //数据操作规则
        dbTable, //表 *必传
        keyId, //主键 id ps：非驼峰
        dbTableFiles: dbTableFiles //附件表 ps：非驼峰
        });
    }

    接口-find
    所有字段支持模糊检索 
    支持附件表查询
    支持附件表 + 关系表 + 关系表附件表查询
    async listAction() {
        await table.list({
            ctx: this.ctx,
            rules: [], //数据操作规则
            dbTable, //表 *必传
            keyId, //主键 id ps：非驼峰
            dbTableFiles, //附件表 ps：非驼峰
            filesField,
            fieldName, //查询时附件表 实现功能类似于 sql 全联查询
            sort:{}, //排序
            isLike:true, //是否使用 like 检索
            paramsHand, //查询参数处理 必须为异步函数
            dataHand, //查询出来的数据处理函数 必须为异步函数
            //以下全部为驼峰 默认注释掉
            // relationTable, //incBook 关系表
            // relationTableKey, //从表关联主表的主键
            // relationTableChildren, // 关系表主键 ps：驼峰
            // relationTableChildrenFilesTableName,
            // relationTableChildrenFilesKey,
            // relationTableChildrenFilesField,
            // relationTableChildrenFilesFieldId
        });
    }

    更新接口
    async updateAction() {
        await table.update({
            ctx: this.ctx,
            rules: update, //数据操作规则
            dbTable, //表 *必传
            filesField,
            keyId, //主键 id ps：非驼峰
            dbTableFiles: dbTableFiles //附件表 ps：非驼峰
        });
    }
