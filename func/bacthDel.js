/*
批量删除或者单独删除
@parmas
{   
     ctx对象:ctx  
    需要删除的数据: delData
    表名：tableName
    数据主键:key
    附件表:attactableName:{ 关系主键:attacKey, 表名:attactableName }
} 
*/
const delfn = async function({
  ctx,
  tableName,
  delData,
  key,
  dbTableFiles = {}
}) {
  if (think.isArray(delData)) {
    //批量删除
    if (!think.isEmpty(dbTableFiles) && dbTableFiles.attacTableName) {
      //附件表存需要删除附件
      let _dbTableFiles = [...delData];
      const { attacKey, attacTableName } = dbTableFiles;
      const modelf = think.model(attacTableName);
      let delKeyArryByAttac = _dbTableFiles.map(item => {
        return item[attacKey];
      });
      const dataf = await modelf
        .where({ [attacKey]: ["IN", delKeyArryByAttac] })
        .delete();
      think.logger.debug(`附件删除信息：`, dataf);
    }
    let dbTableFilesC = [...delData];
    let delArr = dbTableFilesC.map(item => {
      return item[key];
    });
    const model = think.model(tableName);
    const data = await model.where({ [key]: ["IN", delArr] }).delete();
    ctx.body = think.delRes(data);
  } else if (think.isObject(delData)) {
    //单条数据
    if (!think.isEmpty(dbTableFiles)) {
      //附件表存需要删除附件
      const { attacKey, attactableName } = dbTableFiles;
      if (attactableName) {
        const modelf = think.model(attactableName);
        const dataf = await modelf
          .where({ [attacKey]: delData[attacKey] })
          .delete();
        think.logger.debug(`附件删除信息：`, dataf);
      }
    }
    const model = think.model(tableName);
    const data = await model.where({ [key]: delData[key] }).delete();
    ctx.body = think.delRes(data);
  } else {
    think.sysErr("传入的删除数据只能是数据或者object", ctx);
  }
};

export default delfn;
