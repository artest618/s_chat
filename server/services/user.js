var JDB=require("../mysqldbfactory.js");
var util = require('../_util');

var UserService = {
    checkuser: function(uid, onsuccess, onerror){
        var sql = 'SELECT * FROM tb_userinfo WHERE uid=' + uid;
        JDB.query(sql,function(err,vals,fields){
            //console.log(JSON.stringify(vals));
            if(err){
                console.log(JSON.stringify(err));
                onerror && onerror(err);
            }
            for(var i in vals){
                if(vals[i].delflag == 0){
                    onsuccess(true, vals[i]);
                    return;
                }
            }
            onsuccess(false);
        });
    },
    checkuserByName: function(name, callback) {
        var sql = 'SELECT * FROM tb_userinfo WHERE name=\'' + name + '\'';
        JDB.query(sql, function (err, vals, fields) {
            callback(vals);
        });
    },

    addUser: function(user, onsuccess, onerror){
        var sql = 'INSERT INTO tb_userinfo (uid, name, cname, usertype, headicon) VALUES ('+
            user.uid + ',\'' + user.name + '\',\'' + user.cname + '\',' +
            user.usertype + ',\'' + user.headicon + '\')';
        JDB.oper([sql], function(res){
            onsuccess(res);
        })
    },
    checkUserCanAddGroup: function(user){
        if(user.usertype != 3 && user.groupcount >= util.maxGrpPerUser){
            return false;
        }
        return true;
    },
    updateUserGroupCounts: function(user, count, onsuccess, onerror){
        var sql = 'UPDATE tb_userinfo SET groupcount=' + count + ' where uid=' + user.uid;
        JDB.oper([sql], function(res){
            onsuccess && onsuccess(res);
        });
    }
}

module.exports=UserService;