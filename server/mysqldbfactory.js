var mysql=require("mysql");
//var queues = require('mysql-queues');

var pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '1q2w3e4r',
    database: 'chat',
    port: 3306
});

JDB = {
    query: function(sql,callback){
        pool.getConnection(function(err,conn){
            if(err){
                callback(err,null,null);
            }else{
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
               callback(err);
           } else {
               conn.beginTransaction(function(terr){
                  if(terr){throw terr;}
                  console.log("start transaction...");
                  function excutesql(sql, i){
                      conn.query(sql, function(qerr, result){
                          if(qerr){
                              conn.rollback(function(){
                                  console.log(sql);
                                  throw qerr;
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
                          console.log('excuted ' + sql + 'successfully.');
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
                                          throw cerr;
                                      });
                                      return false;
                                  }
                                  console.log('commit successfully and transaction end.');
                                  callback();
                              });
                          }else{
                              conn.rollback(function(){
                                  throw cerr;
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