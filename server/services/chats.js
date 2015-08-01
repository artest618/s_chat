var JDB=require("../mysqldbfactory.js");

var chatService = {
    getChatList: function(uid, onsuccess, onerror){
        console.log('get ' + uid + 'chat list....')
        var sql = "SELECT a.*,b.* FROM tb_contacthistory_list a INNER JOIN tb_userinfo b where a.user=" + uid + " and a.toid = b.uid";
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
    }
}

module.exports=chatService;