var userSerivce = require('./services/user');
var FI = require('./services/finterfaces');
var CounselorService=require("./services/counselor");
var chatService = require('./services/chats');
var util = require("./_util");
var msgService = require('./services/message');

var actions = {
    root: function(req, res){
        var q=req.query,uid = q.uid, pid = q.pid,tid= q.tid, ua = util.isMobile(req),
            send_target = ua ? 'client/views/biunique_chat.html' : 'client/views/index.html';
        if (!req.session.sessiondata || !req.session.sessiondata.user) {
            if(!uid){
                res.send('<script>alert("用户标识错误！");window.close();</script>');
                return;
            }
            if(!FI.checkSigned(uid)){
                res.send('<script>alert("您还未登录系统，请在登录页面进行登录！");window.close();</script>');
                return;
            }
            userSerivce.checkuser(uid, function(flag, user){
                if(flag){
                    req.session.sessiondata = {user: user};
                    console.log(JSON.stringify(user));
                    return res.sendfile(send_target);
                } else{
                    var user = FI.syncUser(uid);
                    if(!user){
                        return res.redirect('/signin');
                    }
                    userSerivce.addUser(user, function(){
                        req.session.sessiondata = {user: user};
                        console.log(req.session.sessiondata);
                        return res.sendfile(send_target);
                    });
                    return;
                }
            });
        }else{
            return res.sendfile(send_target);
        }
    },
    getUserInfo: function(req,res){
        if(!req.session.sessiondata || !req.session.sessiondata.user){
            return res.send({error: '您还未登录系统，请在登录页面进行登录！'});
        }
        var tid = req.body.tid, user = req.session.sessiondata.user;
        console.log('get user info....');
        if(user.usertype == 3){
            res.send( [req.session.sessiondata.user]);
        }else if(!tid){
            throw new Error({error: '指定顾问对象不正确'});
        }
        userSerivce.checkuser(tid, function(f, csr){
            if(user.usertype != 3 && csr && csr.usertype != 3){
                console.log('指定交谈对象非顾问，请联系管理员');
                res.send({error: '指定交谈对象非顾问，请联系管理员'});
                return;
            }
            req.session.sessiondata.counselor = csr;
            req.session.save();
            console.log(req.session.sessiondata);
            res.send( [req.session.sessiondata.user, csr]);
        });
    },
    getChatList: function(req, res){
        console.log(req.session.sessiondata);
        var user = req.session.sessiondata.user, counselor = req.session.sessiondata.counselor;
        if(user.usertype != 3 && !counselor){
            throw new Error("顾问不存在!");
        }
        var list = {
            schat: [],
            gchat: []
        }
        chatService.getChatList(user.uid, function(data){
            if(user.usertype != 3){
                var isNew = true;
                for(var i in data){
                    var u = data[i];
                    if(u.uid == counselor.uid){
                        isNew = false;
                    }
                }
                if(isNew){
                    var chat = {
                        user: user.uid,
                        toid: counselor.uid,
                        totype: 3,
                        name: counselor.name,
                        cname: counselor.cname,
                        headicon: counselor.headicon,
                        lastchattime: new Date().toDateString()
                    };
                    data.unshift(chat);
                    chatService.addChat(chat);
                }
            }
            data.forEach(function(item){
                if(global.onlineUsers[item.uid]){
                    item.isOnline = 1;
                } else {
                    item.isOnline = 0;
                }
            });
            list.schat = data;
            chatService.getUserGroupList(user.uid, function(data){
                list.gchat = data;
                console.log(list);
                res.send(list);
            }, function(err){});
        }, function(err){});
    },
    //顾问在被用户会话时，列表中添加对该用户的会话
    addChat:function(req, res){
        var uid = req.body.uid, tid=req.body.tid;
        console.log(req.query);
        userSerivce.checkuser(tid, function(flag, user){
            if(flag){
                var chat = {
                    user: uid,
                    toid: tid,
                    totype: 1,
                    name: user.name,
                    cname: user.cname,
                    headicon: user.headicon,
                    lastchattime: new Date().toDateString()
                };
                chatService.addChat(chat);
                res.send([chat]);
            } else{
                throw new Error('服务器错误');
            }
        });
    },
    chatHistory: function(req, res){
        var tid = req.body.tid,
            chattype=req.body.chattype,
            page = req.body.page,
            date = req.body.date || null,
            user = req.session.sessiondata.user;
        msgService.readMsg(tid, chattype, user, date, page, function(data){
            res.send(data);
        });
    },
    applyToGroup: function(req, res){
        var user = req.session.sessiondata.user, owner=req.body.owner, group;//group = global.group_user_list[req.body.gid];
        for(var i in global.group_user_list){
            //该判定仅适合客户和客户经理，顾问加群请勿使用本action
            if(global.group_user_list[i].owner == owner && user.usertype+1 == global.group_user_list[i].grouptype){
                group = global.group_user_list[i];
            }
        }
        for(var i in group.members){
            if(group.members[i].uid == user.uid){
                res.send({error: '您已加入了该群，请勿重复申请'});
                return;
            }
        }
        group.members.push(user);
        if(userSerivce.checkUserCanAddGroup(user)){
            chatService.addGroupMember(group, user, function(rlt){
                if(rlt){
                    user.groupcount = parseInt(user.groupcount) + 1;
                    userSerivce.updateUserGroupCounts(user, user.groupcount, function(){});
                    var g = JSON.parse(JSON.stringify(group));
                    delete g.members;
                    res.send(g);
                    return;
                }else{
                    res.send(false);
                }
            });
        }
        else{
            res.send({error: '每位用户最多只能加入3个客户群或客户经理群！'});
        }
    },
    exitGroup: function(req, res){
        var user = req.session.sessiondata.user, groupid=req.body.groupid, group = group_user_list[groupid];
        for(var i in group.members){
            if(group.members[i].uid == user.uid){
                group.members.splice(i, 1);
            }
        }
        chatService.delGroupMember(group, user, function(rlt){
           if(rlt){
               user.groupcount = parseInt(user.groupcount) - 1;
               userSerivce.updateUserGroupCounts(user, user.groupcount, function(){});
               res.send(true);
           }else{
               res.send(false);
           }
        });
    },
    getGroupUsers: function(req, res){
        var tid = req.body.tid;
        global.group_user_list[tid].members.forEach(function(item){
            if(global.onlineUsers[item.uid]){
                item.isOnline = 1;
            } else {
                item.isOnline = 0;
            }
        });
        res.send(global.group_user_list[tid].members);
    },
    signinpage: function(req, res){
        res.sendfile('client/views/signin.html');
    },
    dosignin: function(req, res, users){
        if (users[req.body.name]) {
            //存在，则不允许登陆
            res.redirect('/signin');
        } else {
            //不存在，把用户名存入 cookie 并跳转到主页
            req.session.sessiondata.user = req.body.name;
//            res.session("user", req.body.name, {maxAge: 1000*60*60*24*30});
            res.redirect('/');
        }
    },
    getSignedUser: function(req, res){
        if(req.session.sessiondata.user == null){
            res.redirect('/signin');
        } else {
            res.send({name: req.session.sessiondata.user});
        }
    },
    /**
     * 获取TID or TO
     * @param req
     * @param res
     */
    getUserInfoM:function(req,res){
        if(!req.session.sessiondata || !req.session.sessiondata.user){
            return res.send({error: '您还未登录系统，请在登录页面进行登录！'});
        }
        var tid = req.body.tid, to = req.body.to , user = req.session.sessiondata.user,targetId;
        if(tid&&!to){//U -> T
            targetId=tid;
        }else if(to&&!tid){ // T -> U
            targetId=to;
        }else{
            res.send({error: '指定交谈对象不正确，请联系管理员'});
        }

        userSerivce.checkuser(targetId, function(f, csr){
            if(csr){
                req.session.sessiondata.counselor = csr;
                req.session.save();
                console.log(req.session.sessiondata);
                res.send( [req.session.sessiondata.user, csr]);
            }else{
                res.send( {error: '您访问的聊天对象不存在，请联系管理员'});
            }

        });
    },
    /**
     * 历史列表
     * @param req
     * @param res
     */
    getHistoryList:function(req,res){
        var uid = req.query.uid?parseInt(req.query.uid):"",  user;
        actions.syncUser(req,res,function(obj){
            if(obj.error){
                res.send(obj);
            }else{

                if( uid && obj.uid && (uid==obj.uid) ){
                    chatService.getChatList(uid, function(data){
                        for(i in data){
                            data[i].lastchattime=util.dateFormat("yyyy-MM-dd hh:mm:ss", data[i].lastchattime);
                        }
                        chatService.getUserGroupList(uid, function(gdata){
                            for(i in gdata){
                                gdata[i].jointime=util.dateFormat("yyyy-MM-dd hh:mm:ss", gdata[i].jointime);
                            }
                            res.render("tmpls/m_histroy_page",{data:data,gdata:gdata});
                        }, function(err){});

                    });
                }else{
                    res.send({error:"用户标识不一致"});
                }
            }
        });

    },
    syncUser:function(req,res,callback){
        var q=req.query,uid = q.uid,  ua = util.isMobile(req);
        if (!req.session.sessiondata || !req.session.sessiondata.user) {
            if(!uid){
                callback({error:"用户标识错误"});
            }
            if(!FI.checkSigned(uid)){
                callback({error:"您还未登录系统，请在登录页面进行登录！"});
            }
            userSerivce.checkuser(uid, function(flag, user){
                if(flag){
                    req.session.sessiondata = {user: user};
                    callback(req.session.sessiondata.user);
                } else{
                    var user = FI.syncUser(uid);
                    if(!user){
                        callback({error:"同步用户出错"});
                    }
                    userSerivce.addUser(user, function(){
                        req.session.sessiondata = {user: user};
                        callback(req.session.sessiondata.user);
                    });
                }
            });
        }else{
            callback(req.session.sessiondata.user);
        }
    },
    /**
     * 添加历史联系人
     * @param req
     * @param res
     */
    addChatList:function(req,res){
        var uid = req.body.uid, tid=req.body.tid;
        userSerivce.checkuser(tid, function(flag, user){
            if(flag){
                var chat = {
                    user: uid,
                    toid: tid,
                    totype: 1,
                    name: user.name,
                    cname: user.cname,
                    headicon: user.headicon,
                    lastchattime: new Date().toDateString()
                };
                chatService.addChatForList(chat);
                res.send([chat]);
            } else{
                throw new Error('addChatList error');
            }
        });
    },
    /**
     * 获取组信息
     * @param req
     * @param res
     */
    getGroupInfo:function(req,res){
        var gid=req.body.to;
            if(gid){
                chatService.getGroupInfo(gid,function(obj){
                    if(obj&&obj.length>0){
                        res.send( [req.session.sessiondata.user, obj[0]]);
                    }else{
                        res.send({error:"查无结果"});
                    }
                },function(err){
                    res.send({error:err});
                });
            }else{
                res.send({error:"参数错误"});
            }

    },
    /**
     * 创建顾问
     * @param req.query.uid
     * @param res.query.uanme
     */
    createCounselor:function(req,res){
        CounselorService.createCounselor({uid: req.query.uid,uname:req.query.uname},function(res_obj){
                console.log(res_obj);
                res.send(res_obj);
        });
    },
    offline: function(req, res){
        var uid = req.body.uid;
        console.log(uid + ' is offline.................');
    }

}
module.exports=actions;
