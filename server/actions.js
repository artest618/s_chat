var actions = {
    root: function(req, res){
        if (req.session.user == null) {
            res.redirect('/signin');
        } else {
            res.sendfile('client/views/index.html');
        }
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
    }
}
module.exports=actions; 