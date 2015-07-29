//dependencies
var express = require('express'), 
      http = require('http'),
      path = require('path'),
      actions = require('./server/actions.js'),
      sioHandler = require('./server/sioHandler.js');

var app = express();

// all environments
app.set('port', process.env.PORT || 3030);
app.set('views', __dirname + '/client/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'lgphp', key: 'lgphp' ,cookie: { maxAge: 20000}}));
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
        'pathname': '/createCounselor',
        'handler': actions.createCounselor,
        'method': 'get'
    }
];

for(var i=0; i<routedefines.length; i++){
    app[routedefines[i].method].apply(app, [routedefines[i].pathname, routedefines[i].handler], users) ;
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