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
    pid:'',
    added:false,
    chattype: 'single',
    addingchat: {}
};

require(['zepto', 'common', 'domReady', 'ejs'], function ($, Common, $dom, EJS) {
    var socket = io.connect();

    $dom(function () {
        var sendData = {tid: Common.urlparams.tid, to: Common.urlparams.to,
            totype: Common.urlparams.totype,pid:Common.urlparams.pid};
        if (!sendData.tid && !sendData.to) {
            alert("访问不正确，请联系管理员");
            return;
        }
        if(sendData.totype&&sendData.totype==2){

            Common.post({
                url: 'getGroupInfo',
                data: sendData,
                success: function (data) {
                    if(data){
                        app.chattype='gchat';
                        app.users = data;
                        app.from = data[0];
                        showChatView(sendData.tid ? true : false);
                        socket.emit('online', {user: app.from});
                    }
                },
                error: function (err) {

                }
            });
        }else{
            Common.post({
                url: 'getUserInfoM',
                data: sendData,
                success: function (data) {
                    app.users = data;
                    app.from = data[0];
                    app.pid=sendData.pid?sendData.pid:"";
                    //TODO 过滤
                    showChatView(sendData.tid ? true : false);
                    socket.emit('online', {user: app.from});

                    //向服务器添加联系人
                    Common.post({
                        url: 'addChatList',
                        data: {uid: app.from.uid, tid:data[1].uid},
                        success: function(data){
                        }
                    });
                },
                error: function (err) {

                }
            });
        }

    });

    function showChatView(isTid) {
        var user = app.users[1], fromId = app.from.uid, toId = user.uid||user.id;

        toId = parseInt(toId), app.to = toId;

        $('.chat_view .chat_view_sub').hide();
        if ($('#' + toId).length <= 0) {
            var url = app.chattype == 'single' ? 'views/tmpls/m_msgwindow.ejs' : 'views/tmpls/m_g_msgwindow.ejs';
            var ejs = new EJS({url: url}).render({chat: {
                id: app.to,
                to_cname:user.cname||user.groupname,
                user: fromId,
                to_type:user.usertype,
                isTid: isTid
            }});
            $('.chat_view').append(ejs);
            $('#' + toId).find(".add").on("click",function(){
                //加群
                Common.post({
                    url: 'applyToGroup',
                    data: {owner: toId},
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
                        if(data&&data.groupname){
                            alert("恭喜您成功加入"+data.groupname);
                        }

                    },
                    error: function(err){

                    }
                });
            });

            //历史
            getHistoryMsg(toId, '', 1);
            //发送
            $('#' + toId).find('.fbtnsend').on('click', function () {
                var msg,ejs;
                 msg = $('#' + toId).find('.inputmsg').val();
                 if(!msg){
                     alert("您发送的消息为空！");
                     return false;
                 }
                 ejs = new EJS({url: "views/tmpls/m_msgrow_r.ejs"}).render({msg: {
                    cname: app.from.cname,
                    datetime: Common.formatDate(new Date()),
                    msg: Common.formatMsgDisp(msg)
                }});
                $('#' + toId).find('.c_msg_list').append(ejs);
                $('#' + toId).find('.inputmsg').val('');
                socket.emit('say', {
                    from: app.from.uid,
                    to: app.to,
                    fromname: app.from.cname,
                    toname:user.cname || user.groupname,
                    fromtype: app.from.usertype,
                    totype: user.totype || user.grouptype,
                    chattype: app.chattype,
                    msg: msg
                });

                $(window.document.body).scrollTop($('#' +toId).find('.c_msg_list')[0].scrollHeight);
            });

            //列表
            $(".get_list", "#" + toId).on('click', function () {
                window.location.href = "/getHistoryList?uid=" + fromId;
            });
            //群列表
            $(".showGroupList","#"+toId).on("click",function(){
                window.location.href="/getGroupMembers?gid="+toId+"&uid="+fromId+"&totype="+
                    (app.chattype=='single'?1:2)+"&usertype="+ app.from.usertype;
            });
            //表情
            $('#' + toId).find('.chemoji').on('click', function(e){
                e.stopPropagation();

                if($(this).attr("flag")){
                    $('#' + toId).find(".footer").removeClass("h_new");
                    $('#' + toId).find(".emojipanel").hide().removeClass("show");
                    $(this).removeAttr("flag");
                }else{
                    var ejs = new EJS({url: "views/tmpls/emojipanel.ejs"}).render({emojis: Common.emojis,ua:"mobile"});
                    $('#' + toId).find(".footer").addClass("h_new");
                    $('#' + toId).find(".emojipanel").html(ejs).show().addClass("show").find('.emoji1').on('click', function(e){
                        var inputmsg = $('#' + toId).find('.inputmsg');
                        inputmsg.val(inputmsg.val()  + $(e.target).attr('code')).focus();
                        $('#' + toId).find('.chemoji').removeAttr("flag");
                        $('#' + toId).find(".footer").removeClass("h_new");
                        $('#' + toId).find(".emojipanel").hide().removeClass("show");
                    });
                    $(this).attr("flag","flag");
                }

            });

            //更多
            $('#' + toId).find('.moremsgbtn').on('click', function(){
                getHistoryMsg(toId, $('#' + toId).attr('msgdate'), parseInt($('#' + toId).attr('page')) - 1);
            });

            //判断是否要写入产品信息
            if(app.pid){
                Common.post({
                    url: 'getProductInfo',
                    data: {pid: app.pid},
                    success: function (data) {
                        $('#' + toId).find('.pro_info .pro_img').attr("src", data.productIgUrl);



                        var str = "<div class='f20'>"+data.productName+"</div>"+
                            "<div class='f20'>"+ Common.productDispValue.loanLimit + ":" + data.loanLimit+"</div>"+
                            "<div class='f20'><span>"+Common.productDispValue.monthRate + ":" + data.monthRate+"%</span>"+
                            "<span style='margin-left: 30px'>"+(data.rate && (Common.productDispValue.rate + ":" + data.rate + "%") || '')+"</span></div>"+
                            "<div class='f20'>"+(data.publishTime && (Common.productDispValue.publishTime + ":" + Common.formatDate(data.publishTime, 'yyyy-MM-dd') ) || '')+"</div>";

                        $('#' + toId).find('.pro_info .pro_content').html(str);

                    },
                    error: function (err) {
                    }
                });
            }else{
                $('#' + toId).find('.pro_info').hide()
            }
        }
        $('#' + toId).show();
    }

    function getHistoryMsg(tid, date, page) {
        var tid = parseInt(tid);
        Common.post({
            url: 'chatHistory',
            data: {tid: tid, chattype: app.chattype, date: date, page: page},
            success: function (data) {
                data.msg.forEach(function (item) {
                    item.message = Common.formatMsgDisp(item.message);
                    return item;
                });
                var ejs = new EJS({url: "views/tmpls/m_msgrow.ejs"}).render({data: {msgs: data.msg, user: app.from.uid}});
                $('#' + tid).find('.c_msg_list').append(ejs);
                $(window.document.body).scrollTop($('#' +tid).find('.c_msg_list')[0].scrollHeight);
            },
            error: function (err) {
            }
        });
    }

    socket.on('online', function (data) {
        //显示系统消息


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
                    var ejs = new EJS({url: "views/tmpls/m_msgrow_l.ejs"}).render({msg: {
                        cname: data.fromname,
                        datetime: Common.formatDate(new Date()),
                        msg: Common.formatMsgDisp(data.msg) //.replace(/\n/g, '<br />')
                    }});
                    $('#' + data.to).find('.c_msg_list').append(ejs);
                    $(window.document.body).scrollTop($('#' + data.to).find('.c_msg_list')[0].scrollHeight);
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

                $(window.document.body).scrollTop($('#' + data.from).find('.c_msg_list')[0].scrollHeight);

                if(!app.added){
                    //向服务器添加联系人
                    Common.post({
                        url: 'addChatList',
                        data: {uid: data.to, tid: data.from},
                        success: function(data){
                        }
                    });
                    app.added=true;
                }

            }
        }
    });
});

