var userSerivce = require('./services/user');
var FI = require('./services/finterfaces');
var CounselorService=require("./services/counselor");
var chatService = require('./services/chats');
var util = require("./_util");

var actions = {
    root: function(req, res){
        var q=req.query,uid = q.uid, pid = q.pid,tid= q.tid, ua = util.isMobile(req),
            send_target = ua ? 'client/views/index_m.html' : 'client/views/index.html';
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
            if(user.usertype != 3 && csr.usertype != 3){
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
        chatService.getChatList(user.uid, function(data){
            console.log('.......................');
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
            console.log(data);
            res.send(data);
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
                res.json(res_obj);
        });
    }

}
module.exports=actions; 