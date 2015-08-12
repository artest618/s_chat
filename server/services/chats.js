var JDB=require("../mysqldbfactory.js");

var chatService = {
    getChatList: function(uid, onsuccess, onerror){
        console.log('get ' + uid + 'chat list....')
        var sql = "SELECT a.*,b.* FROM tb_contacthistory_list a INNER JOIN tb_userinfo b WHERE a.user=" + uid + " AND a.toid = b.uid";
        JDB.query(sql,function(err,vals,fields){
            if(err){
                console.log(JSON.stringify(err));
                onerror && onerror(err);
            }
            var validvals = [];
            for(var i in vals){
                if(vals[i].delflag == 0){
                    validvals.push(vals[i]);
                }
            }
            onsuccess(validvals);
        });
    },
    addChat: function(chat, onsuccess){
        var sql = 'INSERT INTO tb_contacthistory_list (user, toid, totype, lastchattime) VALUES ('+
            chat.user + ',\'' + chat.toid + '\',\'' + chat.totype + '\', null)';
        JDB.oper([sql], function(res){
            onsuccess && onsuccess(res);
        });
    },
    getUserGroupList: function(uid, onsuccess, onerror){
        var sql = 'SELECT * FROM tb_group_userlist a INNER JOIN tb_grouplist b WHERE a.userid=' + uid + ' AND a.groupid = b.id';
        JDB.query(sql,function(err,vals,fields){
            if(err){
                console.log(JSON.stringify(err));
                onerror && onerror(err);
            }
            onsuccess(vals);
        });
    },
    getAllGroup: function(onsuccess, onerror){
        var sql = 'SELECT * FROM tb_grouplist';
        JDB.query(sql,function(err,vals,fields){
            if(err) {
                console.log(JSON.stringify(err));
                onerror && onerror(err);
            }
            onsuccess(vals);
        });
    },
    getGroupMebers: function(gid, onsuccess, onerror){
        var sql = 'SELECT * FROM tb_userinfo WHERE uid IN (SELECT userid FROM tb_group_userlist WHERE groupid=' + gid + ')';
        JDB.query(sql,function(err,vals,fields){
            if(err) {
                console.log(JSON.stringify(err));
                onerror && onerror(err);
            }
            onsuccess(vals);
        });
    },
    addGroupMember: function(group, user, onsuccess){
        var sql = "INSERT INTO tb_group_userlist (userid, username, usercname, usertype, groupid, jointime) VALUES (" +
                user.uid + ",'" + user.name + "','" + user.cname + "'," + user.usertype + "," + group.id + ",null)";
        JDB.oper([sql], function(res){
            onsuccess && onsuccess(res);
        });
    },
    delGroupMember: function(group, user, onsuccess){
        var sql = 'DELETE FROM tb_group_userlist where userid=' + user.uid + ' and groupid=' + group.id;
        JDB.oper(sql, function(res){
           onsuccess && onsuccess(res);
        });
    }
}

module.exports=chatService;