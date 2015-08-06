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
    }
}

module.exports=chatService;