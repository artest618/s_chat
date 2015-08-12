"use strict";

define('zepto', ['../js/zepto'], function(){
    return Zepto;
});


require.config({
    baseUrl: '../js',
    waitSeconds: 30,
    paths: {
        domReady: "domReady",
        ejs: "ejs",
        common: "common"
    }
});

var app = {
    from: '',
    to: '',
    chattype: 'single',
    addingchat: {}
};

require(['zepto', 'common', 'domReady', 'ejs'], function($, Common, $dom, EJS){
    var socket = io.connect();

    $dom(function(){
        Common.post({
            url: 'getUserInfo',
            data: {tid: Common.urlparams.tid},
            success: function(data){
                app.users = data;
                app.from = data[0];
                initChatList();
                socket.emit('online', {user: app.from});
            },
            error: function(err){

            }
        });
    });

    function initChatList(){
        Common.post({
            url: 'chatList',
            data: {},
            success: function(data){
                app.chatUsers = data.schat.concat(data.gchat);
                if(app.from.usertype != 3){
                    showChatView(app.users[1].uid);
                }
            },
            error: function(err){}
        });
    }

    function showChatView(tid){
        tid = parseInt(tid), app.to = tid;
        var user = {};
        for(var i in app.chatUsers){
            if(app.chatUsers[i].toid == tid || app.chatUsers[i].groupid == tid){
                user = app.chatUsers[i];
            }
        }
        $('.chat_view .chat_view_sub').hide();
        if($('#' + tid).length <= 0){
            var url = app.chattype == 'single' ? 'views/tmpls/m_msgwindow.ejs' : 'views/tmpls/g_msgwindow.ejs';
            var ejs = new EJS({url: url}).render({chat: {
                id: app.to,
                to_cname: user.cname || user.groupname,
                user: app.from.uid,
                gowner: user.owner
            }});
            $('.chat_view').append(ejs);

            getHistoryMsg(tid);

            $('#' + tid).find('.fbtnsend').on('click', function(){
                var msg = $('#' + tid).find('.inputmsg').val();
                var ejs = new EJS({url: "views/tmpls/m_msgrow_r.ejs"}).render({msg: {
                    cname: app.from.cname,
                    datetime: Common.formatDate(new Date()),
                    msg: msg.replace(/\n/g, '<br />')
                }});
                $('#' + tid).find('.c_msg_list').append(ejs);
                $('#' + tid).find('.inputmsg').val('');
                socket.emit('say', {
                    from: app.from.uid,
                    to: app.to,
                    fromname:app.from.cname,
                    toname:user.cname || user.groupname,
                    fromtype: app.from.usertype,
                    totype: user.totype || user.grouptype,
                    chattype: app.chattype,
                    msg: msg
                });
                $('#' + tid).find('.c_msg_list')[0].scrollTop = $('#' + tid).find('.c_msg_list')[0].scrollHeight;
            });
        }
        $('#' + tid).show();
    }

    function getHistoryMsg(tid, date, page){
        var tid = parseInt(tid);
        Common.post({
            url: 'chatHistory',
            data: {tid: tid, chattype: app.chattype, date: date, page: page},
            success: function(data){
                data.msg.forEach(function(item){
                    item.message = Common.formatMsgDisp(item.message);
                    return item;
                });
                var ejs = new EJS({url: "views/tmpls/msgrow.ejs"}).render({data: {msgs: data.msg, user: app.from.uid}});
                $('#' + tid).find('.c_msg_list').append(ejs);
                $('#' + tid).find('.c_msg_list')[0].scrollTop = $('#' + tid).find('.c_msg_list')[0].scrollHeight;
            },
            error: function(err){}
        });
    }

    socket.on('online', function (data) {
        //显示系统消息
        if (data.user.uid != app.from.uid) {
            $('.contactlistview').find('li').each(function(i, item){
                if($(item).find('span').attr('tid') == parseInt(data.user.uid) ) {
                    $(item).find('span').css('color', 'blue');
                }
            });
        } else {
            //var sys = '<div style="color:#f00">系统(' + now() + '):你进入了聊天室！</div>';
        }

    });
    socket.on('offline', function (data) {

    });
    //服务器关闭
    socket.on('disconnect', function() {
        var sys = '<div style="color:#f00">系统:连接服务器失败！</div>';

    });
    //重新启动服务器
    socket.on('reconnect', function() {
        var sys = '<div style="color:#f00">系统:重新连接服务器！</div>';

    });
    socket.on('say', function (data) {
        data.from = parseInt(data.from), data.to = parseInt(data.to);
        data.from = parseInt(data.from), data.to = parseInt(data.to);
        if(data.chattype == 'gchat'){
            //群聊消息
            if(data.from != parseInt(app.from.uid)){ //非自己发的群消息
                if($('#' + data.to).length <= 0){
                    $('#contact_' + data.to).css('color', 'red');
                }
                else{
                    var msg = $('#' + data.from).find('.inputmsg').val();
                    var ejs = new EJS({url: "views/tmpls/msgrow_l.ejs"}).render({msg: {
                        cname: data.fromname,
                        datetime: Common.formatDate(new Date()),
                        msg: data.msg.replace(/\n/g, '<br />')
                    }});
                    $('#' + data.to).find('.c_msg_list').append(ejs);
                    $('#' + data.to).find('.c_msg_list')[0].scrollTop = $('#' + data.to).find('.c_msg_list')[0].scrollHeight;
                }
            }
        }else{
            //别人给自己发的消息
            if (data.to == app.users[0].uid ){
                if($('#contact_' + data.from).length <= 0){
                    if(!app.addingchat[data.from]){
                        app.addingchat[data.from] = true;
                        Common.post({
                            url: 'addChat',
                            data: {uid: data.to, tid: data.from},
                            success: function(data){
                                app.chatUsers = app.chatUsers.concat(data);
                                var ejs = new EJS({url: "views/tmpls/contactlist.ejs"}).render({data: data});
                                $(".contactlistview").append(ejs);
                                app.addingchat[data.from] = false;
                                $('#contact_' + data.from).css('color', 'red');
                                $('.contactlistview').find('li').unbind('click').on('click', function(e){
                                    showChatView($(e.target).find('span').attr('tid'));
                                });
                            },
                            error: function(err){}
                        });
                    }
                }
                else if($('#' + data.from).length <= 0){
                    $('#contact_' + data.from).css('color', 'red');
                }else{
                    var msg = $('#' + data.from).find('.inputmsg').val();
                    var ejs = new EJS({url: "views/tmpls/msgrow_l.ejs"}).render({msg: {
                        cname: data.fromname,
                        datetime: Common.formatDate(new Date()),
                        msg: data.msg.replace(/\n/g, '<br />')
                    }});
                    $('#' + data.from).find('.c_msg_list').append(ejs);
                    $('#' + data.from).find('.c_msg_list')[0].scrollTop = $('#' + data.from).find('.c_msg_list')[0].scrollHeight;
                }
            }
        }
    });
});

