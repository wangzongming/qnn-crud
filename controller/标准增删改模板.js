import { add, update, del } from "../rules/classify";
import table from '../func/table'
const Base = require("./base.js");
//数据库配置
const dbTable = "tag"; //数据表名
const keyId = "id"; //主键id
const dbTableFiles = ""; //附件表
const filesField = ""; //附件字段名

//关系表配置  字段名应该使用驼峰写法
const relationTableChildren = "incBook"; //关系关系表主键
//主表配置
const relationTable = "all_book"; //关系表主表表名
//从表配置
const relationTableKey = "id"; //从表关联主表的主键
//从表附件表配置
const relationTableChildrenFilesTableName = "all_book_files"; //从表的附件表表名
const relationTableChildrenFilesField = "images"; //从表的附件表附件字段名  前台需要的并不数据库里的
const relationTableChildrenFilesKey = "id"; //从表的附件表的主键
const relationTableChildrenFilesFieldId = "id"; //从表的附件表字段名(关联的字段)

module.exports = class extends Base {
  __before() {
    // 通过 Promise.resolve 将返回值包装为 Promise
    // 如果返回值确定为 Promise，那么就不需要再包装了
    return Promise.resolve(super.__before()).then(flag => {
      // 如果父级想阻止后续继承执行会返回 false，这里判断为 false 的话不再继续执行了。
      if (flag === false) return false;
      return true;
      // 其他逻辑代码
    });
  }
  async addAction() {
    await table.add({
      rules: add,
      ctx: this.ctx,
      keyId,
      dbTable,
      dbTableFiles,
      filesField,
      paramsHand:async function(){}, //参数处理
      onlyKey: "", //: "classify_name",
      otherParams: [] //: ["create_time"]
    });
  }

  async delAction() {
    await table.del({
      filesField,
      ctx: this.ctx,
      rules: del, //数据操作规则
      dbTable, //表 *必传
      keyId, //主键id     ps：非驼峰
      dbTableFiles: dbTableFiles //附件表   ps：非驼峰
    });
  }
  async listAction() {
    await table.list({
      ctx: this.ctx,
      rules: [], //数据操作规则
      dbTable, //表 *必传
      keyId, //主键id     ps：非驼峰
      dbTableFiles, //附件表   ps：非驼峰
      filesField,
      fieldName, //查询时附件表 实现功能类似于sql全联查询
      sort:{}, //排序
      isLike:true, //是否使用like检索
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

  async updateAction() {
    await table.update({
      ctx: this.ctx,
      rules: update, //数据操作规则
      dbTable, //表 *必传
      filesField,
      keyId, //主键id     ps：非驼峰
      dbTableFiles: dbTableFiles //附件表   ps：非驼峰
    });
  }
  __call() {
    //如果相应的Action不存在则调用该方法
    think.noInterface(this.ctx);
  }
};
