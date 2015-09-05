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
        var uid=$("#current_user").val();
            Common.post({
                url: 'getCurrentUser',
                data: {uid:uid},
                success: function (data) {
                    if(data&&data.user){
                        app.from=data.user;
                        socket.emit('online', {user: app.from});
                    }else{
                        alert(data&&data.error);
                    }
                },
                error: function (err) {
                }
            });
            socket.emit('online', {user: app.from});
    });


    socket.on('online', function (data) {
        //显示系统消息
        if (data.user.uid != app.from.uid) {
            $('.single_r','.history_list').each(function (i, item) {
                if ($(item).attr('to') == parseInt(data.user.uid)) {
                    $(item).find('.head_icon').removeClass('gray');
                }
            });
        } else {

        }

    });
    socket.on('offline', function (data) {
        if(data.from!= app.from.uid){
            $('.single_r','.history_list').each(function (i, item) {
                if ($(item).attr('to') == parseInt(data.from)) {
                    $(item).find('.head_icon').addClass('gray');
                }
            });
        }
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


        if(data.chattype != "gchat"){
            if(data.from != app.from.uid){
                $('.single_r','.history_list').each(function (i, item) {
                    if ($(item).attr('to') == parseInt(data.from)) {
                        $(item).find('.head_name').css("color",'red');
                        var node = $(item).find('.marauto'), count = parseInt($.trim(node.text()) == '' ? 0 : $.trim(node.text()));
                        node.html(++count);
                    }
                });
            }
        }else{

            $('.more_r','.history_list').each(function (i, item) {
                if ($(item).attr('to') == parseInt(data.to)) {
                    $(item).find('.head_name').css("color",'red');
                    var node = $(item).find('.marauto'), count = parseInt($.trim(node.text()) == '' ? 0 : $.trim(node.text()));
                    node.html(++count);
                }
            });

        }
    });
});

