"use strict";

define('zepto', ['../js/zepto'], function () {
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

require(['zepto', 'common', 'domReady', 'ejs'], function ($, Common, $dom, EJS) {
    var socket = io.connect();

    $dom(function () {
        var sendData = {tid: Common.urlparams.tid, to: Common.urlparams.to};
        if (!sendData.tid && !sendData.to) {
            alert("error");
            return;
        }
        Common.post({
            url: 'getUserInfoM',
            data: sendData,
            success: function (data) {
                app.users = data;
                app.from = data[0];
                //TODO 过滤
                showChatView(sendData.tid ? true : false);
                socket.emit('online', {user: app.from});
            },
            error: function (err) {

            }
        });
    });

    function showChatView(isTid) {
        var user = app.users[1], fromId = app.from.uid, toId = user.uid;

        toId = parseInt(toId), app.to = toId;

        $('.chat_view .chat_view_sub').hide();
        if ($('#' + toId).length <= 0) {
            var url = app.chattype == 'single' ? 'views/tmpls/m_msgwindow.ejs' : 'views/tmpls/g_msgwindow.ejs';
            var ejs = new EJS({url: url}).render({chat: {
                id: app.to,
                to_cname: app.users[1].cname,
                user: fromId,
                isTid: isTid
            }});
            $('.chat_view').append(ejs);

            getHistoryMsg(toId, '', 999999999);

            $('#' + toId).find('.fbtnsend').on('click', function () {
                var msg = $('#' + toId).find('.inputmsg').val();
                var ejs = new EJS({url: "views/tmpls/m_msgrow_r.ejs"}).render({msg: {
                    cname: app.from.cname,
                    datetime: Common.formatDate(new Date()),
                    msg: msg.replace(/\n/g, '<br />')
                }});
                $('#' + toId).find('.c_msg_list').append(ejs);
                $('#' + toId).find('.inputmsg').val('');
                socket.emit('say', {
                    from: app.from.uid,
                    to: app.to,
                    fromname: app.from.cname,
                    toname: user.cname,
                    fromtype: app.from.usertype,
                    totype: user.usertype,
                    chattype: app.chattype,
                    msg: msg
                });
                $('#' + toId).find('.c_msg_list')[0].scrollTop = $('#' + toId).find('.c_msg_list')[0].scrollHeight;
            });


            $(".get_list", "#" + toId).on('click', function () {
                window.location.href = "/getHistoryList?uid=" + fromId;
            });
        }
        $('#' + toId).show();
    }



    socket.on('online', function (data) {
        //显示系统消息
        if (data.user.uid != app.from.uid) {
            $('.contactlistview').find('li').each(function (i, item) {
                if ($(item).find('span').attr('tid') == parseInt(data.user.uid)) {
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
    socket.on('disconnect', function () {
        var sys = '<div style="color:#f00">系统:连接服务器失败！</div>';

    });
    //重新启动服务器
    socket.on('reconnect', function () {
        var sys = '<div style="color:#f00">系统:重新连接服务器！</div>';

    });
    socket.on('say', function (data) {
        data.from = parseInt(data.from), data.to = parseInt(data.to);

        //群聊消息
        if (data.chattype == 'gchat') {
            //别人发的群消息则显示，自己发的不重复显示
            if (data.from != parseInt(app.from.uid)) {
                //如果消息窗口已经存在（已经点击过聊天列表中对应联系人，聊天窗口已被初始化过或已聊过天）
                //将消息直接添加到聊天窗口
                if ($('#' + data.to).length > 0) {
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
                if ($('.box .currentW').attr('id') != data.to) {
                    $('#contact_' + data.to).addClass('newmeg');
                }
            }
        }
        //单聊消息
        else {
            //别人给自己发的消息
            if (data.to == app.users[0].uid) {
                var ejs = new EJS({url: "views/tmpls/m_msgrow_l.ejs"}).render({msg: {
                    cname: data.fromname,
                    datetime: Common.formatDate(new Date()),
                    msg: Common.formatMsgDisp(data.msg) //.replace(/\n/g, '<br />')
                }});
                $('#' + data.from).find('.c_msg_list').append(ejs);

                $('#' + data.from).find('.c_msg_list')[0].scrollTop = $('#' + data.from).find('.c_msg_list')[0].scrollHeight;
                /*  }*/
            }
        }
    });
});

