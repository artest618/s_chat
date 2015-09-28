var fs = require('fs');
var util = require("../_util");
var logger = require('../logger').logger;

var root = util.msgroot;
if(!fs.existsSync(root)){
    fs.mkdirSync(root);
}
var msgService= {
    addMessage: function(data){
        //顾问给客户发的消息，取data.to即客户的id作为第一个目录
        //客户给顾问发的消息，取data.from即客户的id作为第一个目录
        //群聊，以群id作为第一个目录，即data.to
        data.from = parseInt(data.from), data.to = parseInt(data.to);
        var dir1 = root + (data.chattype == 'single' ? (data.fromtype == 3 ? data.to : data.from) : data.to);
        //顾问给客户发的消息，取data.from即顾问的id作为第二个目录
        //客户给顾问发的消息，取data.to即顾问的id作为第二个目录
        //群聊无第二层目录，是为空
        var dir2 = dir1 + '/' + (data.chattype == 'single' ? (data.fromtype == 3 ? data.from : data.to) : "");

        if(!fs.existsSync(dir1)){
            fs.mkdirSync(dir1);
        }
        if(data.chattype == 'single' && !fs.existsSync(dir2)){
            fs.mkdirSync(dir2);
        }
        var dir = data.chattype == 'single' ? dir2 : dir1;
        //无论群聊或单聊，最终按日期保存聊天记录
        dir += '/' +  util.dateFormat('yyyy-MM-dd');
        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        //当天聊天记录分多文件保存
        var files = fs.readdirSync(dir) || [], len=0;
        files.forEach(function(f){
            if(/^.*\.json$/.test(f)){
                len++
            }
        });
        var file = dir + '/' + (len || 1) + '.json';
        if(fs.existsSync(file)){
            var stats = fs.statSync(file);
            //每个文件大小大于设置值后，将重新启用新文件
            if(stats.size > util.msgfileMaxSize){
                file = dir + '/' + (len + 1) + '.json';
            }
        }
        logger.info(file);
        var record = {
            id: data.from,
            cname: data.fromname,
            //datetime: (new Date()).Format("yyyy-MM-dd hh:mm:ss"),
            datetime: util.dateFormat('yyyy-MM-dd hh:mm:ss'),
            msgtype: data.msgtype,
            message: data.msg
        };
        fs.appendFile(file, JSON.stringify(record) + ',', function(){
            logger.debug('record a message from ' + data.from + ': ' + JSON.stringify(record));
        });
    },
    addMsgToDB: function(data, onsuccess){
        //{
        //    from: app.from.uid,
        //        to: app.to,
        //    fromname:app.from.cname,
        //    toname:user.cname || user.groupname,
        //    fromtype: app.from.usertype,
        //    totype: user.totype || user.grouptype,
        //    chattype: app.chattype,
        //    msgtype: 'file',
        //    msg: {file: file, url: JSON.parse(res).url}
        //}
        var sql = 'INSERT INTO tb_message (custid, counselorid, id, cname, fromtype, totype, chattype, datetime, msgtype, message) values (?, ?, ?, \'?\', ?, ?, \'?\', ?, \'?\', \'?\')';
        var custid = data.chattype == 'single' ? (data.fromtype == 3 ? data.to : data.from) : data.to;
        var counselorid = data.chattype == 'single' ? (data.fromtype == 3 ? data.from : data.to) : data.to;

        if( data.chattype=='gchat'&&data.totype==1){
            data.chattype=data.chattype+'_1';
        }else if(data.chattype=='gchat'&&data.totype==2){
            data.chattype=data.chattype+'_2';
        }else if(data.chattype=='gchat'&&data.totype==3){
            data.chattype=data.chattype+'_3';
        }
        var dataArr = [custid, counselorid, data.from, data.fromname, data.fromtype, data.totype, data.chattype, 'null', data.msgtype, data.msg,,data.toname||""];
        sql = util.formatStrWithParams(sql, dataArr);
        JDB.oper([sql], function(res){
            onsuccess(res);
        });
    },
    readMsgFromDB: function(tid, chattype, user, page, onsuccess){
        var custid = user.usertype == 3 ? tid : user.uid;
        var counselorid = chattype == 'single' ? (user.usertype == 3 ? user.uid : tid) : tid;
        var sql = '';
        if(chattype == 'single'){
            sql = 'SELECT * FROM tb_message where custid=? and counselorid=? order by datetime desc limit ?,?';
            sql = util.formatStrWithParams(sql, [custid, counselorid, (page-1)*util.msgPageRows, util.msgPageRows]);
        }else{
            sql = 'SELECT * FROM tb_message where counselorid=? order by datetime desc limit ?,?';
            sql = util.formatStrWithParams(sql, [counselorid, (page-1)*util.msgPageRows, page*util.msgPageRows]);
        }
        JDB.query(sql,function(err,vals,fields){
            if(err){
                logger.info(JSON.stringify(err));
                onerror && onerror(err);
            }
            for(var i in vals){
                vals[i].datetime = util.dateFormat('yyyy-MM-dd hh:mm:ss', vals[i].datetime);
            }
            var rs = {
                date: vals[0] && util.dateFormat('yyyy-MM-dd', vals[0].datetime),
                page: page,
                msg: vals
            }
            onsuccess(rs);
        });
    },
    readMsg: function(tid, chattype, user, date, page, callback){
        var path = util.msgroot;
        if(chattype == 'single'){
            //拼接单聊目录（格式：客户id/顾问id）
            if(user.usertype == 3){
                path += parseInt(tid) + '/' + parseInt(user.uid);
            }
            else{
                path += parseInt(user.uid) + '/' + parseInt(tid);
            }
        }
        else{
            //拼接群聊目录，群id命名
            path += parseInt(tid);
        }
        var rs = {
            date: date,
            page: page,
            msg: []
        }
        //该两人或该群从未聊过天，
        if(!fs.existsSync(path)){
            callback(rs);
            return;
        }
        //该聊天目录下所有日期的聊天
        var datedirs = fs.readdirSync(path);
        //删除隐藏等非日期目录，即删除非聊天记录目录
        for(var i=datedirs.length-1; i>=0; i--){
            if(!/^\d{4}-\d{1,2}-\d{1,2}$/.test(datedirs[i]))
                datedirs.splice(i, 1);
        }
        //该两人或该群下没有发现任何日期的聊天记录（聊过天，但被删除了时）
        if(datedirs.length<=0){
            callback(rs);
            return;
        }
        date = util.dateFormat('yyyy-MM-dd', date);
        //首次查询page为999999999，日期为今日日期
        //当page小于等于0时，说明是翻页且传入日期记录已取完，需要取传入日期的最近一天的聊天记录了
        if(page <= 0){
            //取传入日期的最近一天存在聊天记录的日期
            for(var i=datedirs.length; i>=0; i--){
                if(datedirs[i]<date){
                    date = datedirs[i];
                    break;
                }
            }
            //取到最早的记录文件了
            if(i<0 && date == datedirs[0]){
                callback(rs);
                return;
            }
            //在该日期的聊天记录中，从最近的记录文件开始查询
            page = 999999999;
            rs.page=page;
            rs.date=date;
        }

        path += '/' + date + '/';
        if(!fs.existsSync(path)){
            rs.page = -1;
            callback(rs);
            return;
        }
        //page=999999999表示该日期聊天记录中最后一页即最新消息开始查询
        if(page == 999999999){
            var files = fs.readdirSync(path) || [], len=0;
            files.forEach(function(f){
                if(/^.*\.json$/.test(f)){
                    len++
                }
            });
            page = len || 1;
            rs.page = page;
        }
        path += page + '.json';

        fs.readFile(path, {encoding:'utf8',flag:'r'}, function(err, data){
            if(err || !data){
                callback(rs);
                return;
            }
            logger.info(data);
            rs.msg = JSON.parse('[' + data.substring(0, data.length-1) + ']');
            callback(rs);
        });
    }
}

module.exports=msgService;