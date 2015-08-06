var message = require('./services/message');
var chatService = require('./services/chats');

var users = {};
var group_user_list = {};

function initGroupInfo(){
    chatService.getAllGroup(function(groups){
        for(var i in groups){
            group_user_list[groups[i].id] = groups[i];
            chatService.getGroupMebers(groups[i].id, function(members){
                group_user_list[groups[i].id].members = members;
            });
        }
    });
}
initGroupInfo();
setInterval(initGroupInfo, 10*60*1000);


var handlers = {
    online: function(socket, data, io){
        //将上线的用户名存储为 socket 对象的属性，以区分每个 socket 对象，方便后面使用
        console.log("my debug info:" + JSON.stringify(data));
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
            //向其他所有用户广播该用户下线信息
            socket.broadcast.emit('offline', {users: users, user: users[socket.uid]});
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
                console.log(group_user_list[data.to]);
                for(var i in group_user_list[data.to].members){
                    console.log('find user...................')
                    if(parseInt(client.uid) == parseInt(group_user_list[data.to].members[i].uid)){
                        console.log('emit to user.................')
                        client.emit('say', data);
                    }
                }
            });

        }
        message.addMessage(data);
    }
}
module.exports=handlers; 