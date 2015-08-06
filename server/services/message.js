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
        console.log(dir1);
        console.log(dir2);

        if(!fs.existsSync(dir1)){
            fs.mkdirSync(dir1);
        }
        if(data.chattype == 'single' && !fs.existsSync(dir2)){
            fs.mkdirSync(dir2);
        }
        var dir = data.chattype == 'single' ? dir2 : dir1;
        var date = new Date(), file = util.dateFormat('yyyy-MM-dd') + '.json';
        var record = {
            id: data.from,
            cname: data.fromname,
            //datetime: (new Date()).Format("yyyy-MM-dd hh:mm:ss"),
            datetime: util.dateFormat('yyyy-MM-dd HH:mm:ss'),
            message: data.msg
        };
        fs.appendFile(dir + '/' + file, JSON.stringify(record) + ',', function(){
            console.log('record a message from ' + data.from + ': ' + JSON.stringify(record));
        });
    },
    readMsg: function(tid, chattype, user, callback){
        var path = util.msgroot,
            filename = util.dateFormat('yyyy-MM-dd') + '.json';
        if(chattype == 'single'){
            if(user.usertype == 3){
                path += parseInt(tid) + '/' + parseInt(user.uid) + '/' + filename;
            }
            else{
                path += parseInt(user.uid) + '/' + parseInt(tid) + '/' + filename;
            }
        }
        else{
            path += parseInt(tid) + '/' + filename;
        }
        console.log(path);
        fs.readFile(path, {encoding:'utf8',flag:'r'}, function(err, data){
            if(err || !data){
                callback([]);
                return;
            }
            console.log(data);
            callback(JSON.parse('[' + data.substring(0, data.length-1) + ']'));
        });
    }
}

module.exports=msgService;