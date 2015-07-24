var JDB=require("./server/mysqldbfactory.js");

var UserService = {
    checkuser: function(uid, callback){
        var sql = 'SELECT * FROM TB_USERINFO WHERE UID=' + uid;
        JDB.query(sql,function(err,vals,fields){
            //console.log(JSON.stringify(vals));
            if(err){
                console.log(JSON.stringify(err));
            }
            callback(vals);
        });
    },
    checkuserByName: function(name, callback){
        var sql = 'SELECT * FROM TB_USERINFO WHERE NAME=\'' + name + '\'';
        JDB.query(sql, function(err, vals, fields){
            callback(vals);
        });
    }
}