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
        common: "common",
        jquery: 'jquery',
        AjaxUpload: 'ajaxupload'
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

require(['jquery', 'common', 'domReady', 'ejs', 'AjaxUpload','mini_msg'], function ($, Common, $dom, EJS) {
    var socket = io.connect();

    $dom(function () {
        var sendData = {tid: Common.urlparams.tid, to: Common.urlparams.to,
            totype: Common.urlparams.totype,pid:Common.urlparams.pid};
        if (!sendData.tid && !sendData.to) {
            _show_msg({msg:"访问不正确，请联系管理员",title:"温馨提示"});
            goBack();
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
                        initChatList(sendData.tid ? true : false);

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
                    if(data[0].usertype==3&&data[1].usertype==3){
                        _show_msg({time:2500,msg:"访问不正确，请联系管理员",title:"温馨提示"});
                        goBack();
                        return;
                    }else if(data[0].usertype==1&&data[1].usertype==1){
                        _show_msg({time:2500,msg:"访问不正确，请联系管理员",title:"温馨提示"});
                        goBack();
                        return;
                    }else{
                        app.users = data;
                        app.from = data[0];
                        app.pid=sendData.pid?sendData.pid:"";
                        //TODO 过滤
                        initChatList(sendData.tid ? true : false);
                        socket.emit('online', {user: app.from});
                        //向服务器添加联系人
                        Common.post({
                            url: 'addChatList',
                            data: {uid: app.from.uid, tid:data[1].uid},
                            success: function(data){
                            }
                        });
                    }

                },
                error: function (err) {

                }
            });
        }

    });

    function initChatList(isTid){
        Common.post({
            url: 'chatList',
            data: {},
            success: function (data) {
                app.chatUsers = data.schat.concat(data.gchat);
                showChatView(isTid);
            }
        })
    }

    function getGroupUsers(tid,call){
        Common.post({
            url: 'getGroupUsers',
            data: {tid:tid},
            success: function (data) {
                app.groupUsers = data;
                call&&call(data);
            }
        })
    }

    function goBack(num){
        setTimeout(function(){
            window.history.go(-1);
        },num||2000);
    }

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

            if(!Common.urlparams.totype){
                $("#history_header").css("display","none");
                $("#message_to_header").css("display","block");
                $("#message_to_header_href").click(function(){
                    if(Common.urlparams.pageType == 1 ||Common.urlparams.pageType == 2){
                        window.location.href = "http://wap.r8china.com/index.htm?module=expert_detil&userId="+Common.urlparams["uid"]+"&expertuserId="+app.to+"&pageType="+Common.urlparams.pageType+"&pType="+(Common.urlparams.pType||"");
                    }else if(Common.urlparams.pageType == 3){
                        window.location.href = "http://wap.r8china.com/index.htm?module=loan_list&userId="+Common.urlparams["uid"]+"&pageType="+Common.urlparams.pageType;
                    }
                });
            }
            //从手机端接入
            if(Common.urlparams.totype==3){
                $("#history_header").css("display","none");
                $("#message_to_header_toapp").css("display","block");
            }

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
                            _show_msg({time:2500,msg:"恭喜您成功加入"+data.groupname,title:"温馨提示"});
                        }

                    },
                    error: function(err){

                    }
                });
            });

            //历史
            getHistoryMsg(toId, '', 1,true);
            //发送
            $('#' + toId).find('.fbtnsend').on('click', function () {
                var msg,ejs;
                 msg = $('#' + toId).find('.inputmsg').val();
                 if(!msg){
                     _show_msg({time:1000,msg:"您发送的消息为空！",title:"温馨提示"});
                     return false;
                 }
                 ejs = new EJS({url: "views/tmpls/m_msgrow_r.ejs"}).render({msg: {
                    cname: app.from.cname,
                    datetime: Common.formatDate(new Date()),
                    headicon: app.from.headicon ? app.from.headicon : '../images/headers/default.png',
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
                    totype: user.usertype || user.grouptype,
                    chattype: app.chattype,
                    msgtype: 'text',
                    to_headicon:app.from.headicon||"../images/headers/default.png",
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
                /*if(parseInt($('#' + toId).attr('page')) - 1>-1){*/
                    getHistoryMsg(toId, $('#' + toId).attr('msgdate'), parseInt($('#' + toId).attr('page')) + 1);
                /*}*/
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

            if(app.chattype == 'single'){
                var au1 = new AjaxUpload($('#' + toId).find('.upfilebtn'), {
                    action: '/upfile',
                    name: 'file',
                    autoSubmit: true,
                    onChange: function(file, ext){
                        if(Common.upfiletypes.image.indexOf(ext[0]) == -1 &&
                            Common.upfiletypes.office.indexOf(ext[0]) == -1 &&
                            Common.upfiletypes.zipfile.indexOf(ext[0]) == -1
                            ){
                            return false;
                        }
                        this.fileid = "file" + parseInt(Math.random()*0xffffff);
                        return true;
                    },
                    onSubmit: function(file, ext){
                        var html = new EJS({url: 'views/tmpls/m_upfileproc.ejs'}).render({
                            fileid: this.fileid,
                            ficon: Common.filetypeicon[Common.getFileTypeByExt(ext)],
                            file: file,
                            percent: 0
                        });
                        var ejs = new EJS({url: "views/tmpls/m_msgrow_r.ejs"}).render({msg: {
                            cname: app.from.cname,
                            datetime: Common.formatDate(new Date()),
                            headicon: app.from.headicon ? app.from.headicon : '../images/headers/default.png',
                            msg: Common.formatMsgDisp(html) //.replace(/\n/g, '<br />')
                        }});
                        $('#' + toId).find('.c_msg_list').append(ejs.replace(/\<\s*br\s*\/\>/g, ''));
                        $(window.document.body).scrollTop($('#' +toId).find('.c_msg_list')[0].scrollHeight);
                    },
                    onprogress: function(loaded, total, per){
                        $('#' + au1.fileid).find('.progress-bar').css('width', per+"%");
                    },
                    onComplete: function(file, res){
                        $('#' + au1.fileid).find('.progress-bar').css('width', "100%");
                        socket.emit('say', {
                            from: app.from.uid,
                            to: app.to,
                            fromname:app.from.cname,
                            toname:user.cname || user.groupname,
                            fromtype: app.from.usertype,
                            totype: user.totype || user.grouptype,
                            chattype: app.chattype,
                            msgtype: 'file',
                            msg: {file: file, url: JSON.parse(res).url}
                        });
                    }
                });
            }
        }
        $('#' + toId).show();
    }

    function getHistoryMsg(tid, date, page,listclick) {
        var tid = parseInt(tid);
        Common.post({
            url: 'chatHistory',
            data: {tid: tid, chattype: app.chattype, date: date, page: page},
            success: function (data) {
                $.each(data.msg, function(i, item){
                    if(item.msgtype == 'text'){
                        item.message = Common.formatMsgDisp(item.message);
                    }else{
                        item.message = Common.formatFileMsg(item.message);
                    }
                    return item;
                });

                var user = {},flag=true;
                if(app.chattype == 'single'){
                    flag=true;
                    for(var i in app.chatUsers){
                        if(app.chatUsers[i].toid == tid){
                            user = app.chatUsers[i];
                        }
                    }
                }else{
                    flag=false;
                    getGroupUsers(tid,function(guser){
                        for(var i in guser){

                            for(var j in  data.msg){
                                if(guser[i].uid == data.msg[j].id){
                                    data.msg[j].toheadicon =(guser[i].headicon|| '../images/headers/default.png');
                                }
                            }
                        }
                    });
                }


                data.msg.sort(function(a,b){
                    return  b.datetime<a.datetime?1:-1;
                });
                var ejs = new EJS({url: "views/tmpls/m_msgrow.ejs"}).render({data: {msgs: data.msg,
                    user: app.from,toheadicon: user.headicon || '../images/headers/default.png',is_flag:flag}});

                ejs = ejs.replace(/\<\s*br\s*\/\>/g, '');
                $('#' + tid).find('.c_msg_list').prepend(ejs);


                $('#' + tid).attr('msgdate', data.date).attr('page', data.page);
                if(listclick){
                    $(window.document.body).scrollTop($('#' +tid).find('.c_msg_list')[0].scrollHeight);
                }

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
                        headicon:data.to_headicon||"../images/headers/default.png",
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
                var msg,user;
                if(data.msgtype == 'text'){
                    msg = Common.formatMsgDisp(data.msg);
                } else if (data.msgtype == 'file') {
                    msg = Common.formatFileMsg(data.msg);
                }

                user=app.users[1];

                var ejs = new EJS({url: "views/tmpls/m_msgrow_l.ejs"}).render({msg: {
                    cname: data.fromname,
                    datetime: Common.formatDate(new Date()),
                    headicon: user.headicon || '../images/headers/default.png',
                    msg: msg //.replace(/\n/g, '<br />')
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

