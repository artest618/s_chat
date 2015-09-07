var mysql=require("mysql");
var logger = require('./logger').logger;
var queues = require('mysql-queues');

var pool = mysql.createPool({
    host: '120.131.68.151',
    user: 'bee_chat',
    password: 'bee_1234',
    database: 'chat',
    port: 3306
});

JDB = {
    query: function(sql,callback){
        pool.getConnection(function(err,conn){
            if(err){
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
        pool.getConnection(function(err, conn){
           if(err){
               console.log(err);
               callback(err);
           } else {
               const DEBUG = true;
               queues(conn, DEBUG);
               conn.beginTransaction(function(terr){
                  if(terr){throw terr;}
                   logger.info("start transaction...");
                  function excutesql(sql, i){
                      logger.debug(sql);
                      conn.query(sql, function(qerr, result){
                          if(qerr){
                              conn.rollback(function(){
                                  logger.debug(sql);
                                  conn.release();
                                  throw qerr;
                                  //释放连接
                                  conn.release();
                              });
                              excutedtracor[i] = {
                                  back: true,
                                  success: false
                              }
                              return false;
                          }
                          excutedtracor[i] = {
                              back: true,
                              success: true
                          }
                          logger.info('excuted ' + sql + 'successfully.');
                      });
                  }
                  var excutedtracor = [];
                  if(sql instanceof Array){
                      for(var i=0; i<sql.length; i++){
                          excutedtracor[i] = {
                              back: false,
                              success: false
                          }
                          excutesql(sql[i], i);
                      }
                  } else {
                      excutesql(sql, 0);
                  }
                  var deffer = setInterval(function(){
                      var allbacked = true, allsuccessed = true;
                      for(var i in excutedtracor){
                          if(!excutedtracor[i].back){
                              allbacked = false;
                          }
                          if(!excutedtracor[i].success){
                              allsuccessed = false;
                          }
                      }
                      if(!allbacked){
                          return false;
                      }else{
                          clearInterval(deffer);
                          if(allsuccessed){
                              conn.commit(function(cerr){
                                  if(cerr){
                                      conn.rollback(function(){
                                          logger.error('error--'+cerr);
                                          //释放连接
                                          conn.release();
                                          callback(false);
                                          //throw cerr;
                                      });
                                      return false;
                                  }
                                  logger.info('commit successfully and transaction end.');
                                  //释放连接
                                  conn.release();
                                  callback(true);
                              });
                          }else{
                              conn.rollback(function(){
                                  logger.error('error--'+cerr);
                                  //释放连接
                                  conn.release();
                                  callback(false);
                                  //throw cerr;
                              });
                          }
                      }

                  }, 100);
               });
           }
        });
    }
}

module.exports=JDB;