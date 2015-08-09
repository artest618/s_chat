var chatService = require('./services/chats');

global.group_user_list = {};

function initGroupInfo(){
    chatService.getAllGroup(function(groups){
        for(var i in groups){
            global.group_user_list[groups[i].id] = groups[i];
            function initUser(i){
                chatService.getGroupMebers(groups[i].id, function(members){
                    global.group_user_list[groups[i].id].members = members;
                    console.log(global.group_user_list);
                });
            }
            initUser(i);
        }
    });
}
initGroupInfo();
setInterval(initGroupInfo, 10*60*1000);