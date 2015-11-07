var mysql=require("mysql");
var logger = require('./logger').logger;

var pool = mysql.createPool({
    host: '120.131.68.151',
    user: 'bee_chat',
    password: 'bee_1234',
    database: 'chat',
    port: 3306,
    multipleStatements: true
});

/*var pool = mysql.createPool({
    host: 'rds2rij2hms78n4347r4.mysql.rds.aliyuncs.com',
    user: 'bee_chat',
    password: 'bee_1234',
    database: 'chat',
    port: 3306
});*/

JDB = {
    query: function(sql,callback){
        pool.getConnection(function(err,conn){
            if(err){
                conn.release();
                logger.error(err);
                callback(err,null,null);
            }else{
                logger.info(sql);
                conn.query(sql,function(qerr,vals,fields){
                    //释放连接
                    conn.release();
                    //事件驱动回调
                    callback(qerr,vals,fields);
                });
            }
        });

    },

    oper: function(sql, callback){
      if (!Array.isArray(sql)) {
        sql = [sql];
      }

      pool.getConnection(function(err, conn){
        if (err) {
          conn.release();
          logger.error(err);
          callback(false);
          return;
        }

        logger.info("start transaction...");
        conn.beginTransaction(function(err){
          if (err) {
            conn.release();
            logger.error(err);
            callback(false);
            return;
          }

          executeSql(0);

          function executeSql(i) {
            logger.info('execute ' + sql[i]);
            conn.query(sql[i], function(err, result){
              if (err) {
                logger.error(err);
                rollback();
                return;
              }

              if (i == (sql.length - 1)) {
                conn.commit(function(err){
                  if (err) {
                    logger.error(err);
                    rollback();
                    return;
                  }

                  conn.release();
                  callback(true);
                });
                return;
              }

              executeSql(i + 1);
            });
          }

          function rollback() {
            conn.rollback(function(){
              conn.release();
              callback(false);
            });
          }

        });
      });
    }
}

module.exports=JDB;
