var JDB=require("../mysqldbfactory.js");

var UserService = {
    checkuser: function(uid, onsuccess, onerror){
        var sql = 'SELECT * FROM TB_USERINFO WHERE UID=' + uid;
        JDB.query(sql,function(err,vals,fields){
            //console.log(JSON.stringify(vals));
            if(err){
                console.log(JSON.stringify(err));
                onerror && onerror(err);
            }
            for(var i in vals){
                if(vals[i].delflag == 1){
                    onsuccess(true, vals[i]);
                    return;
                }
            }
            onsuccess(false);
        });
    },
    checkuserByName: function(name, callback) {
        var sql = 'SELECT * FROM TB_USERINFO WHERE NAME=\'' + name + '\'';
        JDB.query(sql, function (err, vals, fields) {
            callback(vals);
        });
    },

    addUser: function(user, onsuccess, onerror){
        var sql = 'INSERT INTO TB_USERINFO (uid, name, cname, usertype, headicon) VALUES ('+
            user.uid + ',\'' + user.name + '\',\'' + user.cname + '\',' +
            user.usertype + ',\'' + user.headicon + '\')';
        JDB.oper([sql], function(res){
            onsuccess(res);
        })
    }
}

module.exports=UserService;