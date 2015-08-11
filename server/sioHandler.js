var message = require('./services/message');

var users = global.onlineUsers;


var handlers = {
    online: function(socket, data, io){
        //将上线的用户名存储为 socket 对象的属性，以区分每个 socket 对象，方便后面使用
        console.log('用户' + data.user.uid + '上线了..........');
        var user = data.user;
        socket.uid = user.uid;
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
            console.log('user ' + socket.uid + ' disconnected............');
            //向其他所有用户广播该用户下线信息
            socket.broadcast.emit('offline', {uid: socket.uid});
        }
    },
    
    say: function(socket, data, io){
        //clients 为存储所有连接对象的数组
        var clients = io.sockets.clients();
        if(data.chattype == 'single'){
            //向特定用户发送该用户发话信息
            //遍历找到该用户
            clients.forEach(function (client) {
                if (client.uid == data.to) {
                    //触发该用户客户端的 say 事件
                    client.emit('say', data);
                }
            });
        }else{
            clients.forEach(function(client){
                console.log(global.group_user_list[data.to].members);
                for(var i in global.group_user_list[data.to].members){
                    if(parseInt(client.uid) == parseInt(global.group_user_list[data.to].members[i].uid)){
                        client.emit('say', data);
                    }
                }
            });

        }
        message.addMessage(data);
    }
}
module.exports=handlers; 