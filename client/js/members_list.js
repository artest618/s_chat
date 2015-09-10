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
        mini_msg:'mini_msg',
        common: "common"
    }
});

var app = {
    from: '',
    to: '',
    chattype: 'single',
    addingchat: {}
};

require(['zepto', 'common', 'domReady', 'ejs','mini_msg'], function ($, Common, $dom, EJS) {
    var socket = io.connect();

    $dom(function () {
            var uid,to,totype;
                $(".row .member_n",".all_members").on("click",function(){
                        uid=$(this).attr("uid");
                        to =$(this).attr("to");
                        Common.showLoading();
                        window.location.href="/?uid="+uid+"&to="+to;
                });
                //回群聊
                $(".go_gchat",".header").on("click",function(){
                       uid = $(this).attr("uid");
                        to = $(this).attr("to");
                    totype = $(this).attr("totype");
                        Common.showLoading();
                        window.location.href="/?uid="+uid+"&to="+to+"&totype="+totype;
                });
                //退群
                $(".exitGroup",".header").on("click",function(){
                       uid = $(this).attr("uid");
                        to = $(this).attr("to");
                       Common.post({
                            url: 'exitGroup',
                            data: {groupid: to},
                            success: function(data){
                                if(data){
                                    _show_msg({msg:"您已退出该群",title:"温馨提示"});
                                    Common.showLoading();
                                    window.location.href="/getHistoryList?uid="+uid
                                }
                            },
                            error: function(err){

                            }
                       });
                });

    });


    socket.on('online', function (data) {
        //显示系统消息
        if (data.user.uid != app.from.uid) {
            $('.add').find('li').each(function (i, item) {
                if ($(item).find('span').attr('tid') == parseInt(data.user.uid)) {
                    $(item).find('span').css('color', 'blue');
                }
            });
        } else {
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

