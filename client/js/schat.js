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
        //window.onbeforeunload = function(){
        //    return '您确认要离开聊天页面么？';
        //}
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
                    app.chattype = $(e.target).attr('chattype');
                    var tid = $(e.target).attr('tid');
                    showChatView(tid);
                    $('#contact_' + tid).removeClass('newmeg');
                    $('#' + tid).find('.l-c1-c3')[0].scrollTop = $('#' + tid).find('.l-c1-c3')[0].scrollHeight;
                });
            },
            error: function(err){}
        });
    }

    function showChatView(tid){
        tid = parseInt(tid), app.to = tid;
        var user = {}, joinedGroup = false;
        for(var i in app.chatUsers){
            if(app.chatUsers[i].toid == tid || app.chatUsers[i].groupid == tid){
                user = app.chatUsers[i];
            }
            //从群列表中查询用户是否已加入当前顾问的对应群
            if(app.chatUsers[i].groupid && app.chatUsers[i].owner && parseInt(app.chatUsers[i].owner) == tid){
                joinedGroup = true;
            }
        }
        if(user.usertype != 3 || app.from.usertype == 3){
            joinedGroup = true;
        }
        $('.box .box-in').removeClass('currentW').hide();
        if($('#' + tid).length <= 0){
            var url = app.chattype == 'single' ? 'views/tmpls/msgwindow.ejs' : 'views/tmpls/g_msgwindow.ejs';
            var ejs = new EJS({url: url}).render({chat: {
                id: app.to,
                to_cname: user.cname || user.groupname,
                user: app.from.uid,
                gowner: user.owner,
                joinedGroup: joinedGroup
            }});
            $('.box').append(ejs);

            getHistoryMsg(tid, '', 999999999);
            app.chattype == 'gchat' && getGroupUsers(tid);

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
                $('#' + tid).find('.l-c1-c3')[0].scrollTop = $('#' + tid).find('.l-c1-c3')[0].scrollHeight;
            });
            $('#' + tid).find('.applyGroup').on('click', function(){
                Common.post({
                    url: 'applyToGroup',
                    data: {owner: tid},
                    success: function(data){
                        var chat = {
                            id: data.id,
                            userid: app.from.uid,
                            username: app.from.name,
                            usercname: app.from.cname,
                            usertype: app.from.usertype,
                            groupid: data.id,
                            owner: data.owner,
                            ownername: data.ownername,
                            ownercname: data.ownercname,
                            groupname: data.groupname,
                            grouptype: data.grouptype,
                            groupnum: data.groupnum
                        }
                        app.chatUsers.push(chat);
                        var ejs = new EJS({url: "views/tmpls/contactlist.ejs"}).render({data: [chat], chattype: 'gchat'});
                        $(".contactlistview").append(ejs);
                        $('.contactlistview').find('li').unbind('click').on('click', function(e){
                            app.chattype = $(e.target).attr('chattype');
                            var tid = $(e.target).attr('tid');
                            showChatView(tid);
                            $('#contact_' + tid).removeClass('newmeg');
                            $('#' + tid).find('.l-c1-c3')[0].scrollTop = $('#' + data.from).find('.l-c1-c3')[0].scrollHeight;
                        });
                    },
                    error: function(err){

                    }
                });
            });
            $('#' + tid).find('.moremsgbtn').on('click', function(){
                getHistoryMsg(tid, $('#' + tid).attr('msgdate'), parseInt($('#' + tid).attr('page')) - 1);
            });
        }
        $('#' + tid).addClass('currentW').show();
        $('#' + tid).find('.l-c1-c3')[0].scrollTop = $('#' + tid).find('.l-c1-c3')[0].scrollHeight;
    }

    function getGroupUsers(tid){
        Common.post({
            url: 'getGroupUsers',
            data: {tid: tid},
            success: function(data){
                var ejs = new EJS({url: "views/tmpls/groupuserlist_r.ejs"}).render({users: data});
                $("#" + tid).find('.mberlist').append(ejs);
                if(app.from.usertype == 3){
                    $('#' + tid).find('.guserlist_r').on('click', function(e){
                        var uid = $(e.target).attr('uid'), user;
                        if(uid == app.from.uid){
                            return;
                        }
                        for(var i in data){
                            if(data[i].uid == uid){
                                user = data[i];
                            }
                        }
                        if($('#contact_' + parseInt(uid)).length <= 0){
                            app.chatUsers.push(user);
                            if(!app.addingchat[uid]){
                                app.addingchat[uid] = true;
                                Common.post({
                                    url: 'addChat',
                                    data: {uid: app.from.uid, tid: uid},
                                    success: function(data){
                                        var ejs = new EJS({url: "views/tmpls/contactlist.ejs"}).render({data: data, chattype:'single'});
                                        $(".contactlistview").append(ejs);
                                        app.addingchat[uid] = false;
                                        $('.contactlistview').find('li').unbind('click').on('click', function(e){
                                            showChatView($(e.target).attr('tid'));
                                            app.chattype = $(e.target).attr('chattype');
                                        });
                                        app.chattype = 'single';
                                        showChatView(uid);
                                    },
                                    error: function(err){}
                                });
                            }
                        }else{
                            app.chattype = 'single';
                            showChatView(uid);
                        }
                    });
                }
            },
            error: function(err){

            }
        });
    }

    function getHistoryMsg(tid, date, page){
        var tid = parseInt(tid);
        Common.post({
            url: 'chatHistory',
            data: {tid: tid, chattype: app.chattype, date: date, page: page},
            success: function(data){
                var ejs = new EJS({url: "views/tmpls/msgrow.ejs"}).render({data: {msgs: data.msg, user: app.from.uid}});
                $('#' + tid).find('.l-c1-c3').prepend(ejs); //.append(ejs);
                //$('#' + tid).find('.l-c1-c3')[0].scrollTop = $('#' + tid).find('.l-c1-c3')[0].scrollHeight;
                $('#' + tid).attr('msgdate', data.date).attr('page', data.page);
            },
            error: function(err){}
        });
    }

    socket.on('online', function (data) {
        //显示系统消息
        if (data.user.uid != app.from.uid) {
            //var sys = '<div style="color:#f00">系统(' + now() + '):' + '用户 ' + data.user + ' 上线了！</div>';
            $('.contactlistview').find('li').each(function(i, item){
                if($(item).attr('tid') == parseInt(data.user.uid) ) {
                    $(item).addClass('current');
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
        $('.contactlistview').find('li').each(function(i, item){
            if($(item).attr('tid') == parseInt(data.uid) ) {
                $(item).removeClass('current');
            }
        });
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
        data.from = parseInt(data.from), data.to = parseInt(data.to);
        data.from = parseInt(data.from), data.to = parseInt(data.to);
        //群聊消息
        if(data.chattype == 'gchat'){
            //别人发的群消息则显示，自己发的不重复显示
            if(data.from != parseInt(app.from.uid)){
                //如果消息窗口已经存在（已经点击过聊天列表中对应联系人，聊天窗口已被初始化过或已聊过天）
                //将消息直接添加到聊天窗口
                if($('#' + data.to).length > 0){
                    var msg = $('#' + data.from).find('.inputmsg').val();
                    var ejs = new EJS({url: "views/tmpls/msgrow_l.ejs"}).render({msg: {
                        cname: data.fromname,
                        datetime: Common.formatDate(new Date()),
                        msg: data.msg.replace(/\n/g, '<br />')
                    }});
                    $('#' + data.to).find('.l-c1-c3').append(ejs);
                    $('#' + data.to).find('.l-c1-c3')[0].scrollTop = $('#' + data.to).find('.l-c1-c3')[0].scrollHeight;
                }
                //当前聊天窗口并非消息要显示的窗口，提示消息
                if($('.box .currentW').attr('id') != data.to){
                    $('#contact_' + data.to).addClass('newmeg');
                }
            }
        }
        //单聊消息
        else{
            //别人给自己发的消息
            if (data.to == app.users[0].uid ){
                //联系人列表中，没有消息发送者(客户首次给顾问发消息时，顾问联系人列表中没有顾客)
                if($('#contact_' + data.from).length <= 0){
                    //当前是否正在往联系人列表添加该联系人
                    if(!app.addingchat[data.from]){
                        app.addingchat[data.from] = true;
                        //向服务器添加该联系人
                        Common.post({
                            url: 'addChat',
                            data: {uid: data.to, tid: data.from},
                            success: function(data){
                                //往聊天列表中添加该联系人
                                app.chatUsers = app.chatUsers.concat(data);
                                var ejs = new EJS({url: "views/tmpls/contactlist.ejs"}).render({data: data, chattype: data.chattype});
                                $(".contactlistview").append(ejs);
                                app.addingchat[data.from] = false;
                                $('#contact_' + data.from).addClass('newmeg');
                                $('.contactlistview').find('li').unbind('click').on('click', function(e){
                                    var tid = $(e.target).attr('tid');
                                    showChatView(tid);
                                    app.chattype = $(e.target).attr('chattype');
                                    $('#contact_' + tid).removeClass('newmeg');
                                    $('#' + tid).find('.l-c1-c3')[0].scrollTop = $('#' + tid).find('.l-c1-c3')[0].scrollHeight;
                                });
                            },
                            error: function(err){}
                        });
                    }
                }
                //联系人列表中有消息发送者，但是用户当前还未打开过与该联系人的聊天窗口，直接提示消息
                else if($('#' + data.from).length <= 0){
                    $('#contact_' + data.from).addClass('newmeg');
                }
                //消息发送者的聊天窗口已经被打开过，直接往窗口中添加聊天消息
                else{
                    var msg = $('#' + data.from).find('.inputmsg').val();
                    var ejs = new EJS({url: "views/tmpls/msgrow_l.ejs"}).render({msg: {
                        cname: data.fromname,
                        datetime: Common.formatDate(new Date()),
                        msg: data.msg.replace(/\n/g, '<br />')
                    }});
                    $('#' + data.from).find('.l-c1-c3').append(ejs);
                    //当前聊天窗口并非消息要显示的窗口，提示消息
                    if($('.box .currentW').attr('id') != data.from){
                        $('#contact_' + data.from).addClass('newmeg');
                    }else{
                        $('#' + data.from).find('.l-c1-c3')[0].scrollTop = $('#' + data.from).find('.l-c1-c3')[0].scrollHeight;
                    }
                }
            }
        }
    });
});

