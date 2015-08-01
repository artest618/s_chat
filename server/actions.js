var userSerivce = require('./services/user');
var FI = require('./services/finterfaces');
var CounselorService=require("./services/counselor");
var chatService = require('./services/chats');
var util = require("./_util");

var actions = {
    root: function(req, res){
        if (req.session.user == null) {
            //res.redirect('/signin');
            var q=req.query,uid = q.uid, pid = q.pid,tid= q.tid, ua = util.isMobile(req),
                send_target = ua ? 'client/views/index_m.html' : 'client/views/index.html';
            if(!uid || !tid){
                res.send('<script>alert("用户标识错误！");window.close();</script>');
                return;
            }
            if(!FI.checkSigned(uid)){
                res.send('<script>alert("您还未登录系统，请在登录页面进行登录！");window.close();</script>');
                return;
            }
            userSerivce.checkuser(uid, function(flag, user){
                if(flag){
                    req.session.user = user;
                    console.log(JSON.stringify(user));
                    return res.sendfile(send_target);
                } else{
                    var user = FI.syncUser(uid);
                    if(!user){
                        return res.redirect('/signin');
                    }
                    userSerivce.addUser(user, function(){
                        req.session.user = user;
                        return res.sendfile(send_target);
                    });
                    return;
                }
            });
        }else{
            return res.sendfile('client/views/index.html');
        }
    },
    getUserInfo: function(req,res){
        var tid = req.body.tid;
        if(! req.session.user){
            return res.redirect('/signin');
        }
        console.log('get user info....');
        userSerivce.checkuser(tid, function(f, user){
            req.session.counselor = user;
            res.send( [req.session.user, user]);
        });
    },
    getChatList: function(req, res){
        var user = req.session.user, counselor = req.session.counselor;
        console.log(typeof user);
        console.log(typeof counselor);
        chatService.getChatList(user.uid, function(data){
            console.log('.......................');
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
                    totype: 1,
                    name: counselor.name,
                    cname: counselor.cname,
                    headicon: counselor.headicon,
                    lastchattime: new Date().toDateString()
                }
                data.unshift(chat);
                chatService.addChat(chat);
            }
            console.log(data);
            res.send(data);
        }, function(err){});
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
            req.session.user = req.body.name;
//            res.session("user", req.body.name, {maxAge: 1000*60*60*24*30});
            res.redirect('/');
        }
    },
    getSignedUser: function(req, res){
        if(req.session.user == null){
            res.redirect('/signin');
        } else {
            res.send({name: req.session.user});
        }
    },
    /**
     * 创建顾问
     * @param req
     * @param res
     */
    createCounselor:function(req,res){
        CounselorService.createCounselor({uid: req.query.uid,uname:req.query.uname},function(res_obj){
                console.log(res_obj);
                res.json(res_obj);
        });
    }

}
module.exports=actions; 