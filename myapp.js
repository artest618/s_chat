//dependencies
require('./server/globalcache');
var express = require('express'), 
      http = require('http'),
      path = require('path'),
      actions = require('./server/actions.js'),
      sioHandler = require('./server/sioHandler.js');


var app = express();

// all environments
app.set('port', process.env.PORT || 9003);
app.set('views', __dirname + '/client/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser('keyboard cat'));
app.use(express.session({ secret: '134443', key: 'uiuvj' ,cookie: { maxAge: 1800000}, path: '/'}));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'client')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var routedefines = [
    {
        'pathname': '/',
        'handler': actions.root,
        'method': 'get'
    },
    {
        'pathname': '/signin',
        'handler': actions.signinpage,
        'method': 'get'
    },
    {
        'pathname': '/signin',
        'handler': actions.dosignin,
        'method': 'post'
    },
    {
        'pathname': '/getSignedUser',
        'handler': actions.getSignedUser,
        'method': 'post'
    },
    {
        'pathname': '/getUserInfo',
        'handler': actions.getUserInfo,
        'method': 'post'
    },
    {
        'pathname': '/chatList',
        'handler': actions.getChatList,
        'method': 'post'
    },
    {
        'pathname': '/createCounselor',
        'handler': actions.createCounselor,
        'method': 'get'
    },
    {
        'pathname': '/addChat',
        'handler': actions.addChat,
        'method': 'post'
    },
    {
        'pathname': '/chatHistory',
        'handler': actions.chatHistory,
        'method': 'post'
    },
    {
        'pathname': '/applyToGroup',
        'handler': actions.applyToGroup,
        'method': 'post'
    },
    {
        'pathname': '/getGroupUsers',
        'handler': actions.getGroupUsers,
        'method': 'post'
    },
    {
        'pathname': '/offline',
        'handler': actions.offline,
        'method': 'post'
    },
    {
        'pathname': '/exitGroup',
        'handler': actions.exitGroup,
        'method': 'post'
    },
    {
        'pathname': '/getUserInfoM',
        'handler': actions.getUserInfoM,
        'method': 'post'
    },
    {
        'pathname': '/getHistoryList',
        'handler': actions.getHistoryList,
        'method': 'get'
    },
    {
        'pathname': '/addChatList',
        'handler': actions.addChatList,
        'method': 'post'
    },
    {

        'pathname': '/getGroupInfo',
        'handler': actions.getGroupInfo,
        'method': 'post'
    }

];

for(var i=0; i<routedefines.length; i++){
    var handle = (function bb(i){
        var handler = routedefines[i].handler;
        var method = routedefines[i].method;
        var path = routedefines[i].pathname;
        return function (req, res){
            try{
                console.log('action ' + routedefines[i].pathname + ' start-------------------------------------------');
                if(path != '/' && path != '/createCounselor' && path != '/getHistoryList' && path!='/offline' && !req.session.sessiondata){
                    res.send({error: "您还未登录，请登录后再试"});
                    return ;
                }
                handler(req, res);
            }catch(e){
                console.log(e);
                console.log(e.stack);
                if(method == 'post'){
                    res.send({error: "服务器正忙，请稍后再�?..."});
                }
                else {
                    res.redirect('/');
                }
            }
        }
    })(i);
    app[routedefines[i].method].apply(app, [routedefines[i].pathname, handle], users) ;
}

var users = {};
var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
var seventdefines = {
    'online': sioHandler.online,
    'say': sioHandler.say,
    'disconnect': sioHandler.disconnect
}
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {

    socket.on('online', function(data){
        sioHandler['online'](socket, data, io);
    });
    socket.on('say',  function(data){
        sioHandler['say'](socket, data, io);
    });
    socket.on('disconnect',  function(data){
        sioHandler['disconnect'](socket, data, io);
    });
    /*
    for(var f in seventdefines){
        if(f){
            console.log(typeof f);
            socket.on(f, function(data){
                seventdefines[f].apply(sioHandler, [socket, data, io])
            });
        }
    }*/
    /*
    for(var evt in sioHandler){
        if(evt){
            console.log(evt + '.........');
            socket.on(evt, function(data){
                console.log('on' + evt + '.........');
                sioHandler[evt].apply(app, [socket, data, io]);
            });
        }
    }*/
});