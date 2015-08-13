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
        var sendData={tid:Common.urlparams.tid,to:Common.urlparams.to};
        if(!sendData.tid&&!sendData.to){alert("error");return;}
        Common.post({
            url: 'm_getUserInfo',
            data: sendData,
            success: function(data){
                app.users = data;
                app.from = data[0];
                showChatView(sendData.tid?true:false);
                socket.emit('online', {user: app.from});
            },
            error: function(err){

            }
        });
    });

    function showChatView(isTid){
        var user = {},tid=;
        if(isTid){//是否是U -> T
            tid = parseInt(tid), app.to = tid;
        }else{//T -> U

        }



        $('.chat_view .chat_view_sub').hide();
        if($('#' + tid).length <= 0){
            var url = app.chattype == 'single' ? 'views/tmpls/m_msgwindow.ejs' : 'views/tmpls/g_msgwindow.ejs';
            var ejs = new EJS({url: url}).render({chat: {
                id: app.to,
                to_cname: user.cname,
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
                        msg: Common.formatMsgDisp(data.msg) //.replace(/\n/g, '<br />')
                    }});
                    $('#' + data.to).find('.c_msg_list').append(ejs);
                    $('#' + data.to).find('.c_msg_list')[0].scrollTop = $('#' + data.to).find('.c_msg_list')[0].scrollHeight;
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
               /* if($('#contact_' + data.from).length <= 0){
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
                                    $('#' + tid).find('.c_msg_list')[0].scrollTop = $('#' + tid).find('.c_msg_list')[0].scrollHeight;
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
                else{*/
                    var msg = $('#' + data.from).find('.inputmsg').val();
                    var ejs = new EJS({url: "views/tmpls/msgrow_l.ejs"}).render({msg: {
                        cname: data.fromname,
                        datetime: Common.formatDate(new Date()),
                        msg: Common.formatMsgDisp(data.msg) //.replace(/\n/g, '<br />')
                    }});
                    $('#' + data.from).find('.c_msg_list').append(ejs);
                    //当前聊天窗口并非消息要显示的窗口，提示消息
                    if($('.box .currentW').attr('id') != data.from){
                        $('#contact_' + data.from).addClass('newmeg');
                    }else{
                        $('#' + data.from).find('.c_msg_list')[0].scrollTop = $('#' + data.from).find('.c_msg_list')[0].scrollHeight;
                    }
              /*  }*/
            }
        }
    });
});

