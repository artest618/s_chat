var message = require('./services/message');

var users = global.onlineUsers;
var unreadcount = global.unreadMsgCount;
var logger = require('./logger').logger;


var handlers = {
    online: function(socket, data, io){
        //将上线的用户名存储为 socket 对象的属性，以区分每个 socket 对象，方便后面使用
        logger.info('用户' + data.user.uid + '上线了..........');
        var user = data.user;
        socket.uid = user.uid;
        onlineSocket[parseInt(user.uid)] = socket;
        //users 对象中不存在该用户名则插入该用户名
        if (!users[user.uid]) {
            users[user.uid] = user;
        }
        //向所有用户广播该用户上线信息
        io.sockets.emit('online', {users: users, user: user});
    },

    disconnect: function(socket, data, io){
        //若 users 对象中保存了该用户名
        if (users[socket.uid]) {
            //从 users 对象中删除该用户名
            delete users[socket.uid];
            delete onlineSocket[socket.uid];
            logger.info('user ' + socket.uid + ' disconnected............');
            //向其他所有用户广播该用户下线信息
            socket.broadcast.emit('offline', {uid: socket.uid});
        }
    },

    say: function(socket, data, io){
        data.from = parseInt(data.from);
        data.to = parseInt(data.to);
        var userisOnline = false;
        if(data.chattype == 'single'){
            if(onlineSocket[data.to]){
                //触发该用户客户端的 say 事件
                logger.info('++++++++++++++++++向客户端'+data.to+'   发送消息');
                onlineSocket[data.to].emit('say', data);
                logger.info('++++++++++++++++++向客户端'+data.to+'   发送消息');
                userisOnline = true;
            }
            if(!userisOnline){
                unreadcount[data.to] = unreadcount[data.to] == undefined ? {} : unreadcount[data.to];
                unreadcount[data.to][data.from] = unreadcount[data.to][data.from] == undefined ? 1 : ++unreadcount[data.to][data.from];
            }
        }else{
            var members = global.group_user_list[data.to].members;
            for(var i in members){
                userisOnline = false;
                if(onlineSocket[parseInt(members[i].uid)]){
                    onlineSocket[parseInt(members[i].uid)].emit('say', data);
                    userisOnline = true;
                }
                if(!userisOnline){
                    unreadcount[parseInt(members[i].uid)] = unreadcount[parseInt(members[i].uid)] == undefined ? {} : unreadcount[parseInt(members[i].uid)];
                    unreadcount[parseInt(members[i].uid)][data.to] = unreadcount[parseInt(members[i].uid)][data.to] == undefined ? 1 : ++unreadcount[parseInt(members[i].uid)][data.to];
                }
            }
        }
        message.addMsgToDB(data, function(){});
    }
}
module.exports=handlers;
