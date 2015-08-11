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

//存储聊天记录的文件，单个文件的最大大小
//如果最后一条消息的大小特别大，文件实际大小可能会超过该值
global.msgfileMaxSize = 102400;