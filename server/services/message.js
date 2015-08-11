var fs = require('fs');
var util = require("../_util");

console.log(process.cwd());
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
            if(stats.size > global.msgfileMaxSize){
                file = dir + '/' + (len + 1) + '.json';
            }
        }
        console.log(file);
        var record = {
            id: data.from,
            cname: data.fromname,
            //datetime: (new Date()).Format("yyyy-MM-dd hh:mm:ss"),
            datetime: util.dateFormat('yyyy-MM-dd hh:mm:ss'),
            message: data.msg
        };
        fs.appendFile(file, JSON.stringify(record) + ',', function(){
            console.log('record a message from ' + data.from + ': ' + JSON.stringify(record));
        });
    },
    readMsg: function(tid, chattype, user, date, page, callback){
        var path = util.msgroot,
            date = util.dateFormat('yyyy-MM-dd', date);
        if(page <= 0){
            page = 999999999;
            date = new Date(date);
            date = new Date(date.setDate(date.getDate()-1));
            date = util.dateFormat('yyyy-MM-dd', date);
        }
        if(chattype == 'single'){
            if(user.usertype == 3){
                path += parseInt(tid) + '/' + parseInt(user.uid);
            }
            else{
                path += parseInt(user.uid) + '/' + parseInt(tid);
            }
        }
        else{
            path += parseInt(tid);
        }
        path += '/' + date + '/';
        var rs = {
            date: date,
            page: page,
            msg: []
        }
        if(!fs.existsSync(path)){
            callback(rs);
            return;
        }

        if(page == 999999999){
            var files = fs.readdirSync(path) || [], len=0;
            files.forEach(function(f){
                if(/^.*\.json$/.test(f)){
                    len++
                }
            });
            page = len || 1;
        }
        rs.page = page;
        path += page + '.json';

        console.log(path);
        fs.readFile(path, {encoding:'utf8',flag:'r'}, function(err, data){
            if(err || !data){
                callback(rs);
                return;
            }
            console.log(data);
            rs.msg = JSON.parse('[' + data.substring(0, data.length-1) + ']');
            callback(rs);
        });
    }
}

module.exports=msgService;