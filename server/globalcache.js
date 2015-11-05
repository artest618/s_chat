var chatService = require('./services/chats');

//缓存所有群信息和群用户列表
global.group_user_list = {};

function initGroupInfo(){
    chatService.getAllGroup(function(groups){
        for(var i in groups){
            global.group_user_list[groups[i].id] = groups[i];
            function initUser(i){
                chatService.getGroupMebers(groups[i].id, function(members){
                    global.group_user_list[groups[i].id].members = members;
                });
            }
            initUser(i);
        }
    });
}
initGroupInfo();
setInterval(initGroupInfo, 10*60*1000);

//在线用户数组
global.onlineUsers = {};

//缓存活动socket链接
global.onlineSocket = {};

//未读消息数
global.unreadMsgCount = {};