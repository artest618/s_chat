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
        common: "common",
        jquery: 'jquery',
        AjaxUpload: 'ajaxupload'
    }
});

var app = {
    from: '',
    to: '',
    chattype: 'single',
    addingchat: {}
};

require(['jquery', 'common', 'domReady', 'ejs', 'AjaxUpload'], function($, Common, $dom, EJS, AjaxUpload){
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
        $(document).on('click', function(e){
            $(".emojipanel").hide();
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
                if(app.from.usertype != 3 && app.users[1]){
                    showChatView(app.users[1].uid);
                    getProductInfo(app.users[1].uid);
                }
                $('.contactlistview').find('li').on('click', function(e){
                    $('.contactlistview').find('li').removeClass("cur")
                    $(this).addClass("cur");
                    app.chattype = $(e.target).attr('chattype');
                    var tid = $(e.target).attr('tid');
                    showChatView(tid);
                    //$('#contact_' + tid).removeClass('newmeg');
                    $('#contact_' + tid).siblings('.newmsgtip').removeClass('new').html('');
                    $('#' + tid).find('.dialog_c_e')[0].scrollTop = $('#' + tid).find('.dialog_c_e')[0].scrollHeight;
                    getProductInfo(tid);
                });

                require(["../js/jquery.vticker.js"], function(){
                    $('#box_wwwzzjs_net').vTicker({
                        showItems: 7
                    });
                });
            },
            error: function(err){}
        });
    }

    function getProductInfo(tid){
        tid = parseInt(tid);
        Common.urlparams.tid = parseInt(Common.urlparams.tid);
        if(
            (//用户从产品页进入，指定了顾问，且当前聊天对象就是指定的顾问
                Common.urlparams.tid && Common.urlparams.tid == tid ||
                //用户自己就是顾问，url中带了pid
                app.from.usertype == 3
            ) && Common.urlparams.pid ){
            Common.post({
                url: 'getProductInfo',
                data: {pid: Common.urlparams.pid},
                success: function(data){
                    //for(var k in data){
                    //    if(Common.constants[k]){
                    //        data[k] = Common.constants[k]['_'+data[k]];
                    //    }
                    //}
                    //var ejs = new EJS({url: 'views/tmpls/product.ejs'}).render({keys: Common.productDispValue, vals: data});
                    data && data.productIgUrl && $('#' + tid).find('.productimgcontainer img').attr('src', data.productIgUrl);

                    //var str = "<div>"+data.productName+"</div>"+
                    //    "<div>"+ Common.productDispValue.loanLimit + ":" + data.loanLimit+"</div>"+
                    //    "<div>"+Common.productDispValue.monthRate + ":" + data.monthRate+"%</div>"+
                    //    "<div>"+(data.rate && (Common.productDispValue.rate + ":" + data.rate + "%；") || '')+"</div>"+
                    //    "<div>"+ (data.stageRate && (Common.productDispValue.stageRate + ":" + data.stageRate + "% ") || '')+"</div>"+
                    //    "<div>"+(data.publishTime && (Common.productDispValue.publishTime + ":" + Common.formatDate(data.publishTime, 'yyyy-MM-dd') ) || '')+"</div>"+
                    //    "<div>"+(data.endTime && (Common.productDispValue.endTime + ":" + Common.formatDate(data.endTime, 'yyyy-MM-dd')) || '')+"</div>";


                    var str = "<div>"+(data.productName||"贷款产品")+"</div>"+
                        "<div>"+"贷款额度:" + (data.loanLimit||"0")+"万</div>"+
                        "<div>"+"还款方式:" + (Common.constants.repayMethod[data.repayMethod||"_1"]||"等额本息")+"</div>"+
                        "<div>"+"贷款期限:" + Common.constants.loanPeriod[data.loanPeriod&&"_"+data.loanPeriod||"_1"] +"</div>"+
                        "<div>"+"放款周期:" + "8" +"天</div>"+
                        "<div>"+ "月利率:" + (data.monthRate&&data.monthRate+"%"||"0%")+"</div>";
                    data && $('#' + tid).find('.productinfocontainer').html(str);
                }
            });
        }
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
        $('.chattile').html(user.cname || user.groupname);
        $('.chatwindow .boxin').removeClass('currentW').hide();
        if($('#' + tid).length <= 0){
            var url = app.chattype == 'single' ? 'views/tmpls/msgwindow.ejs' : 'views/tmpls/g_msgwindow.ejs';
            var ejs = new EJS({url: url}).render({chat: {
                id: app.to,
                to_cname: user.cname || user.groupname,
                user: app.from.uid,
                gowner: user.owner,
                joinedGroup: joinedGroup
            }});
            $('.chatwindow').append(ejs);

            getHistoryMsg(tid, '', 999999999, true);
            app.chattype == 'gchat' && getGroupUsers(tid);

            $('#' + tid).find('.btnclose').on('click', function(){
                $('#' + tid).remove();
                $('.chattile').html('');
            });
            $('#' + tid).find('.btnsend').on('click', function(){
                var msg = $('#' + tid).find('.inputmsg').val();
                if(!msg){
                    Common.showAlert('请输入消息后发送。');
                    return;
                }
                var ejs = new EJS({url: "views/tmpls/msgrow_r.ejs"}).render({msg: {
                    cname: app.from.cname,
                    datetime: Common.formatDate(new Date()),
                    headicon: app.from.headicon ? app.from.headicon : '../images/picb.png',
                    msg: Common.formatMsgDisp(msg) //.replace(/\n/g, '<br />')
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
                    msgtype: 'text',
                    msg: msg
                });
                $('#' + tid).find('.dialog_c_e')[0].scrollTop = $('#' + tid).find('.dialog_c_e')[0].scrollHeight;
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
                            //$('#contact_' + tid).removeClass('newmeg');
                            $('#contact_' + tid).siblings('.newmsgtip').removeClass('new').html('');
                            $('#' + tid).find('.dialog_c_e')[0].scrollTop = $('#' + data.from).find('.dialog_c_e')[0].scrollHeight;
                        });
                        $('#' + tid).find('.applyGroup').hide();
                    },
                    error: function(err){

                    }
                });
            });
            $('#' + tid).find('.moremsgbtn').on('click', function(){
                getHistoryMsg(tid, $('#' + tid).attr('msgdate'), parseInt($('#' + tid).attr('page')) - 1);
            });
            $('#' + tid).find('.exitgbtn').on('click', function(){
                getHistoryMsg(tid, $('#' + tid).attr('msgdate'), parseInt($('#' + tid).attr('page')) - 1);
                Common.post({
                    url: 'exitGroup',
                    data: {groupid: tid},
                    success: function(data){
                        if(data){
                            $('#' + tid).remove();
                            $('.contactlistview').find('li').each(function(i,item){
                                if($(item).attr('tid') == tid){
                                    $(item).remove();
                                }
                            });
                        }
                    },
                    error: function(err){

                    }
                });
            });
            $('#' + tid).find('.chemoji').on('click', function(e){
                e.stopPropagation();
                var ejs = new EJS({url: "views/tmpls/emojipanel.ejs"}).render({emojis: Common.emojis});
                $('#' + tid).find(".emojipanel").html(ejs).show().find('.emoji1').on('click', function(e){
                    var inputmsg = $('#' + tid).find('.inputmsg');
                    inputmsg.val(inputmsg.val()  + $(e.target).attr('code')).focus();
                });
            });
            if(app.chattype == 'single'){
                var au1 = new AjaxUpload($('#' + tid).find('.upfilebtn'), {
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
                        var html = new EJS({url: 'views/tmpls/upfileproc.ejs'}).render({
                            fileid: this.fileid,
                            ficon: Common.filetypeicon[Common.getFileTypeByExt(ext)],
                            file: file,
                            percent: 0
                        });
                        var ejs = new EJS({url: "views/tmpls/msgrow_r.ejs"}).render({msg: {
                            cname: app.from.cname,
                            datetime: Common.formatDate(new Date()),
                            msg: Common.formatMsgDisp(html) //.replace(/\n/g, '<br />')
                        }});
                        $('#' + tid).find('.l-c1-c3').append(ejs.replace(/\<\s*br\s*\/\>/g, ''));
                        $('#' + tid).find('.dialog_c_e')[0].scrollTop = $('#' + tid).find('.dialog_c_e')[0].scrollHeight;
                    },
                    onprogress: function(loaded, total, per){
                        $('#' + au1.fileid).find('.progress-bar').css('width', per * 100);
                    },
                    onComplete: function(file, res){
                        $('#' + au1.fileid).find('.progress-bar').css('width', 100);
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

            //new AjaxUpload($('#' + tid).find('.upimgbtn'), {
            //    action: '/upfile',
            //    name: 'file',
            //    autoSubmit: true,
            //    onChange: function(file, ext){
            //
            //    },
            //    onSubmit: function(file, ext){
            //
            //    },
            //    onprogress: function(loaded, total, per){
            //
            //    },
            //    onComplete: function(file, res){
            //
            //    }
            //});
        }
        $('#' + tid).addClass('currentW').show();
        $('#' + tid).find('.dialog_c_e')[0].scrollTop = $('#' + tid).find('.dialog_c_e')[0].scrollHeight;
    }

    function getGroupUsers(tid){
        Common.post({
            url: 'getGroupUsers',
            data: {tid: tid},
            success: function(data){
                var ejs = new EJS({url: "views/tmpls/groupuserlist_r.ejs"}).render({users: data});
                $("#" + tid).find('.mberlist[utype!=3]').append(ejs);
                if(app.from.usertype == 3){
                    $('#' + tid).find('.guserlist_r').on('click', function(e){
                        var uid = $(e.target).attr('uid'),utype=$(e.target).attr('utype'), user;
                        if(utype == 3){
                            return false;
                        }
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

    function getHistoryMsg(tid, date, page, listclick){
        var tid = parseInt(tid);
        Common.post({
            url: 'chatHistory',
            data: {tid: tid, chattype: app.chattype, date: date, page: page},
            success: function(data){
                $.each(data.msg, function(i, item){
                    if(item.msgtype == 'text'){
                        item.message = Common.formatMsgDisp(item.message);
                    }else{
                        item.message = Common.formatFileMsg(item.message);
                    }
                    return item;
                });
                var user = {};
                for(var i in app.chatUsers){
                    if(app.chatUsers[i].toid == tid){
                        user = app.chatUsers[i];
                    }
                }
                if(data.msg.length > 0 ){
                    $('#' + tid).find('.l-c1-c3 .tip').remove();
                }
                var ejs = new EJS({url: "views/tmpls/msgrow.ejs"}).render({data: {msgs: data.msg, user: app.from, toheadicon: user.headicon || '../images/picb.png'}});
                ejs = ejs.replace(/\<\s*br\s*\/\>/g, '');
                $('#' + tid).find('.l-c1-c3').prepend(ejs); //.append(ejs);
                if(listclick){
                    $('#' + tid).find('.dialog_c_e')[0].scrollTop = $('#' + tid).find('.dialog_c_e')[0].scrollHeight;
                }
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
                    $(item).find('img').attr('src', data.user.headicon ? data.user.headicon : '../images/picb.png');
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
                $(item).find('img').attr('src', '../images/custom_r3_c1.jpg');
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
                        headicon: '../images/picb.png',
                        msg: Common.formatMsgDisp(data.msg) //.replace(/\n/g, '<br />')
                    }});
                    $('#' + data.to).find('.l-c1-c3').append(ejs);
                    $('#' + data.to).find('.dialog_c_e')[0].scrollTop = $('#' + data.to).find('.dialog_c_e')[0].scrollHeight;
                }
                //当前聊天窗口并非消息要显示的窗口，提示消息
                if($('.box .currentW').attr('id') != data.to){
                    var node = $('#contact_' + data.to).siblings('.newmsgtip'), count = parseInt($.trim(node.text()) == '' ? 0 : $.trim(node.text()));
                    node.addClass('new').html(++count);
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
                                var node = $('#contact_' + data.from).siblings('.newmsgtip'), count = parseInt($.trim(node.text()) == '' ? 0 : $.trim(node.text()));
                                node.html(++count);
                                node.hasClass('new') || (node.addClass('new'));
                                $('.contactlistview').find('li').unbind('click').on('click', function(e){
                                    $('.contactlistview').find('li').removeClass("cur")
                                    $(this).addClass("cur")
                                    var tid = $(e.target).attr('tid');
                                    showChatView(tid);
                                    app.chattype = $(e.target).attr('chattype');
                                    //$('#contact_' + tid).removeClass('newmeg');
                                    $('#contact_' + tid).siblings('.newmsgtip').removeClass('new').html('');
                                    $('#' + tid).find('.dialog_c_e')[0].scrollTop = $('#' + tid).find('.dialog_c_e')[0].scrollHeight;
                                });
                            },
                            error: function(err){}
                        });
                    }
                }
                //联系人列表中有消息发送者，但是用户当前还未打开过与该联系人的聊天窗口，直接提示消息
                else if($('#' + data.from).length <= 0){
                    var node = $('#contact_' + data.from).siblings('.newmsgtip'), count = parseInt($.trim(node.text()) == '' ? 0 : $.trim(node.text()));
                    node.addClass('new').html(++count);
                }
                //消息发送者的聊天窗口已经被打开过，直接往窗口中添加聊天消息
                else{
                    var msg;
                    if(data.msgtype == 'text'){
                        msg = Common.formatMsgDisp(data.msg);
                    } else if (data.msgtype == 'file') {
                        msg = Common.formatFileMsg(data.msg);
                    }
                    var user = {};
                    for(var i in app.chatUsers){
                        if(app.chatUsers[i].toid == data.from){
                            user = app.chatUsers[i];
                        }
                    }
                    var ejs = new EJS({url: "views/tmpls/msgrow_l.ejs"}).render({msg: {
                        cname: data.fromname,
                        datetime: Common.formatDate(new Date()),
                        headicon: user.headicon || '../images/picb.png',
                        msg: msg //.replace(/\n/g, '<br />')
                    }});
                    $('#' + data.from).find('.l-c1-c3').append(ejs);
                    //当前聊天窗口并非消息要显示的窗口，提示消息
                    if($('.chatwindow .currentW').attr('id') != data.from){
                        var node = $('#contact_' + data.from).siblings('.newmsgtip'), count = parseInt($.trim(node.text()) == '' ? 0 : $.trim(node.text()));
                        node.html(++count);
                        node.hasClass('new') || (node.addClass('new'));
                    }else{
                        $('#' + data.from).find('.dialog_c_e')[0].scrollTop = $('#' + data.from).find('.dialog_c_e')[0].scrollHeight;
                    }
                }
            }
        }
    });
});

