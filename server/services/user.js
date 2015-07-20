var JDB=require("./server/mysqldbfactory.js");

var UserService = {
    checkuser: function(uid, callback){
        var sql = 'SELECT * FROM TB_USERINFO WHERE UID=' + uid;
        JDB.query(sql,function(err,vals,fields){
            console.log(JSON.stringify(vals));
        });
    },

}