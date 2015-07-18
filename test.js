var JDB=require("./server/mysqldbfactory.js");

JDB.query("select * from TB_USERINFO",function(err,vals,fields){
    console.log(JSON.stringify(vals));
});

//var sql = [
//    "INSERT INTO TB_USERINFO (uid, name, cname, usertype, groupcount, createdate) VALUES (1, 'user1', '张三', 1, 3, '2015/07/10 10:53:24')",
//    "INSERT INTO TB_USERINFO (uid, name, cname, usertype, groupcount, createdate) VALUES (2, 'user2', '李四', 1, 3, '2015/07/10 10:53:24')",
//    "INSERT INTO TB_USERINFO (uid, name, cname, usertype, groupcount, createdate) VALUES (3, 'user3', '王五', 1, 3, '2015/07/10 10:53:24')",
//    "INSERT INTO TB_USERINFO (uid, name, cname, usertype, groupcount, createdate) VALUES (4, 'user4', '赵六', 1, 3, '2015/07/10 10:53:24')"
//];
//
////sql = 'DELETE FROM TB_USERINFO';
//
//JDB.oper(sql, function(){
//    console.log('insert successfully,affected 4 rows.')
//});
