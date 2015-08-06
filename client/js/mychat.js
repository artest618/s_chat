"use strict";

define('zepto', ['../js/zepto'], function(){
    return Zepto;
});

//define('io.socket', ['/socket.io/socket.io'], function(){
//
//});

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
                var ejs = new EJS({url: "views/tmpls/contactlist.ejs"}).render({data: data.schat, chattype: 'single'});
                $(".contactlistview").html(ejs);
                var ejs = new EJS({url: "views/tmpls/contactlist.ejs"}).render({data: data.gchat, chattype: 'gchat'});
                $(".contactlistview").append(ejs);
                if(app.from.usertype != 3){
                    showChatView(app.users[1].uid);
                }
                $('.contactlistview').find('li').on('click', function(e){
                    app.chattype = $(e.target).find('span').attr('chattype');
                    showChatView($(e.target).find('span').attr('tid'));
                });
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
        $('.box .box-in').hide();
        if($('#' + tid).length <= 0){
            var url = app.chattype == 'single' ? 'views/tmpls/msgwindow.ejs' : 'views/tmpls/g_msgwindow.ejs';
            var ejs = new EJS({url: url}).render({chat: {
                id: app.to,
                to_cname: user.cname || user.groupname,
                user: app.from.uid,
                gowner: user.owner
            }});
            $('.box').append(ejs);

            getHistoryMsg(tid);

            $('#' + tid).find('.btnclose').on('click', function(){
                $('#' + tid).remove();
            });
            $('#' + tid).find('.btnsend').on('click', function(){
                var msg = $('#' + tid).find('.inputmsg').val();
                var ejs = new EJS({url: "views/tmpls/msgrow_r.ejs"}).render({msg: {
                    cname: app.from.cname,
                    datetime: Common.formatDate(new Date()),
                    msg: msg.replace(/\n/g, '<br />')
                }});
                $('#' + tid).find('.l-c1-c3').append(ejs);
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
            });
        }
        $('#' + tid).show();
    }

    function getHistoryMsg(tid){
        var tid = parseInt(tid);
        Common.post({
            url: 'chatHistory',
            data: {tid: tid, chattype: app.chattype},
            success: function(data){
                var ejs = new EJS({url: "views/tmpls/msgrow.ejs"}).render({data: {msgs: data, user: app.from.uid}});
                $('#' + tid).find('.l-c1-c3').append(ejs);
                $('#' + tid).find('.l-c1-c3')[0].scrollTop = $('#' + tid).find('.l-c1-c3')[0].scrollHeight;
                //$('#' + data.from).find('.l-c1-c3').scrollTop($('#' + data.from).find('.l-c1-c3')[0].scrollHeight);
                //app.chatUsers = data;
                //var ejs = new EJS({url: "views/tmpls/contactlist.ejs"}).render({data: data});
                //$(".contactlistview").html(ejs);
                //if(app.from.usertype != 3){
                //    showChatView(app.users[1].uid);
                //}
                //$('.contactlistview').find('li').on('click', function(e){
                //    showChatView($(e.target).find('span').attr('tid'));
                //    app.chattype = 'single';
                //});
            },
            error: function(err){}
        });
    }

    socket.on('online', function (data) {
        //显示系统消息
        if (data.user.uid != app.from.uid) {
            //var sys = '<div style="color:#f00">系统(' + now() + '):' + '用户 ' + data.user + ' 上线了！</div>';
            $('.contactlistview').find('li').each(function(i, item){
                if($(item).find('span').attr('tid') == parseInt(data.user.uid) ) {
                    $(item).find('span').css('color', 'blue');
                }
            });
        } else {
            //var sys = '<div style="color:#f00">系统(' + now() + '):你进入了聊天室！</div>';
        }
        //$("#contents").append(sys + "<br/>");
        ////刷新用户在线列表
        //flushUsers(data.users);
        ////显示正在对谁说话
        //showSayTo();
    });
    socket.on('offline', function (data) {
        ////显示系统消息
        //var sys = '<div style="color:#f00">系统(' + now() + '):' + '用户 ' + data.user + ' 下线了！</div>';
        //$("#contents").append(sys + "<br/>");
        ////刷新用户在线列表
        //flushUsers(data.users);
        ////如果正对某人聊天，该人却下线了
        //if (data.user == to) {
        //    to = "all";
        //}
        ////显示正在对谁说话
        //showSayTo();
    });
    //服务器关闭
    socket.on('disconnect', function() {
        var sys = '<div style="color:#f00">系统:连接服务器失败！</div>';
        //$("#contents").append(sys + "<br/>");
        //$("#list").empty();
    });
    //重新启动服务器
    socket.on('reconnect', function() {
        var sys = '<div style="color:#f00">系统:重新连接服务器！</div>';
        //$("#contents").append(sys + "<br/>");
        //socket.emit('online', {user: from});
    });
    socket.on('say', function (data) {
        //别人对自己发的消息
        data.from = parseInt(data.from), data.to = parseInt(data.to);
        if (data.to == app.users[0].uid) {
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
                $('#' + data.from).find('.l-c1-c3').append(ejs);
            }
            //$("#contents").append('<div>' + data.from + '(' + now() + ')对 所有人 说：<br/>' + data.msg + '</div><br />');
        }
    });
});

