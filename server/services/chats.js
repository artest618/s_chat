var JDB=require("../mysqldbfactory.js");

var chatService = {
    getChatList: function(uid, onsuccess, onerror){
        console.log('get ' + uid + 'chat list....')
        var sql = "SELECT a.*,b.* FROM tb_contacthistory_list a INNER JOIN tb_userinfo b where a.user=" + uid + " and a.toid = b.uid";
        console.log(sql);
        JDB.query(sql,function(err,vals,fields){
            if(err){
                console.log(JSON.stringify(err));
                onerror && onerror(err);
            }
            var validvals = [];
            for(var i in vals){
                if(vals[i].delflag == 0){
                    //onsuccess(true, vals[i]);
                    //return;
                    validvals.push(vals[i]);
                }
            }
            onsuccess(validvals);
        });
    }
}

module.exports=chatService;