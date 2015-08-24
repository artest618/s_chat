var userSerivce = require('./services/user');
var FI = require('./services/finterfaces');
var CounselorService=require("./services/counselor");
var chatService = require('./services/chats');
var util = require("./_util");
var msgService = require('./services/message');
var fs = require('fs');

var actions = {
    root: function(req, res){
        var q=req.query,uid = q.uid, pid = q.pid,tid= q.tid, ua = util.isMobile(req),
            send_target = ua ? 'client/views/biunique_chat.html' : 'client/views/index.html';
        if (!req.session.sessiondata || !req.session.sessiondata.user) {
            if(!uid){
                res.send('<script>alert("用户标识错误！");window.close();</script>');
                return;
            }
            FI.checkSigned(uid, function(suser){
                if(suser){
                    userSerivce.checkuser(uid, function(flag, user){
                        if(flag){
                            req.session.sessiondata = {user: user};
                            console.log(JSON.stringify(user));
                            return res.sendfile(send_target);
                        } else{
                            //var user = FI.syncUser(uid);
                            userSerivce.addUser(suser, function(){
                                req.session.sessiondata = {user: suser};
                                console.log(req.session.sessiondata);
                                return res.sendfile(send_target);
                            });
                            return;
                        }
                    });
                }else{
                    res.send('<script>alert("您还未登录系统，请在登录页面进行登录！");window.close();</script>');
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
        if(!tid){
            res.send( [req.session.sessiondata.user]);
            return;
        }
        //if(user.usertype == 3){
        //    res.send( [req.session.sessiondata.user]);
        //}else if(!tid){
        //    throw new Error({error: '指定顾问对象不正确'});
        //}
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
        //if(user.usertype != 3 && !counselor){
        //    throw new Error("顾问不存在!");
        //}
        var list = {
            schat: [],
            gchat: []
        }
        chatService.getChatList(user.uid, function(data){
            //客户身份进入的聊天系统，并且指定了顾问时
            //判断是否已经存在与该顾问的聊天，若不存在，则自动增加
            if(user.usertype != 3 && counselor){
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
    testrequest: function(req, res){
        var uid = req.body.uid;
        console.log(uid + ' is offline.................');
        res.send({data: 'ok'})
    },
    upfile: function(req, res){
        var files = req.files.file,user = req.session.sessiondata.user;
        //非html5上传文件时，files就是文件本身，为了统一处理，也转换成数组
        if('undefined' == typeof files.length){
            files = [files];
        }
        for(var i=0; i < files.length; i++){
            var file = files[i], path = file.path, oname = name = file.name, targetpath =util.upfile_root, url = util.upfile_url_bas;
            if(util.upfile_exts.indexOf(name.split('.')[1]) == -1){
                res.send({error: '您上传的文件不在允许范围内'});
                return;
            }
            if(!fs.existsSync(targetpath)){
                fs.mkdirSync(targetpath);
            }
            targetpath+= user.uid + '/';
            url += user.uid + '/';
            if(!fs.existsSync(targetpath)){
                fs.mkdirSync(targetpath);
            }
            var filepath = targetpath + name, i=0;
            while(fs.existsSync(filepath)){
                name = oname.split('.')[0] + (++i) + '.' + name.split('.')[1];
                filepath = targetpath + name;
            }
            url += name;
            fs.rename(path, filepath, function(err){
                if(err){
                    throw err;
                }else{
                    res.send({
                        url: url,
                        filename: name
                    });
                }
            });
        }
    }

}
module.exports=actions; 