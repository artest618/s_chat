var JDB=require("./server/mysqldbfactory.js");
var fs = require('fs');
//
//JDB.query("select * from TB_USERINFO",function(err,vals,fields){
//    if(err){
//        console.log(JSON.stringify(err));
//    }
//    console.log(JSON.stringify(vals));
//    console.log(JSON.stringify(fields));
//});

//var sql = [
//    "INSERT INTO TB_USERINFO (uid, name, cname, usertype, groupcount, createdate) VALUES (1, 'user1', '张三', 1, 3, '2015/07/10 10:53:24')",
//    "INSERT INTO TB_USERINFO (uid, name, cname, usertype, groupcount, createdate) VALUES (2, 'user2', '李四', 1, 3, '2015/07/10 10:53:24')",
//    "INSERT INTO TB_USERINFO (uid, name, cname, usertype, groupcount, createdate) VALUES (3, 'user3', '王五', 1, 3, '2015/07/10 10:53:24')",
//    "INSERT INTO TB_USERINFO (uid, name, cname, usertype, groupcount, createdate) VALUES (4, 'user4', '赵六', 1, 3, '2015/07/10 10:53:24')"
//];
//
////sql = 'DELETE FROM TB_USERINFO';
//
//JDB.oper(sql, function(result){
//    if(result){
//        console.log(JSON.stringify(result));
//    }else{
//        console.log('insert successfully,affected 4 rows.')
//    }
//
//});

var files = fs.readdirSync('msgdata/9892995/14814529');
for(var i=files.length-1; i>=0; i--){
    if(!/^\d{4}-\d{1,2}-\d{1,2}$/.test(files[i]))
        files.splice(i, 1);
}
console.log(files);
