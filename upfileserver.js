require('./server/globalcache');
var express = require('express'),
    http = require('http'),
    path = require('path'),
    actions = require('./server/actions.js'),
    sioHandler = require('./server/sioHandler.js'),
    logger = require('./server/logger').logger;

var app = express();
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var options = {
    host: "101.200.199.11",
    port: 6379,
    db: 1,
    secret: 'keyboard cat'
};

app.set('port', process.env.PORT || 9003);
app.set('views', __dirname + '/client/views');
app.set('view engine', 'ejs');
app.set('upfiles', __dirname + '/client/upfiles');
logger.use(app);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({uploadDir: './tmp'}));
app.use(express.cookieParser('keyboard cat'));
app.use(session({ store:new RedisStore(options) ,cookie: { maxAge: 1800000}, path: '/'}));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'client')));

global.process.on('uncaughtException', function(e){
    logger.error(e.message + '\n' + e.stack);
});

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var routedefines = [
    {
        'pathname': '/upfile',
        'handler': function(req, res){
            var files = req.files.file;
            //非html5上传文件时，files就是文件本身，为了统一处理，也转换成数组
            if('undefined' == typeof files.length){
                files = [files];
            }
            for(var i=0; i < files.length; i++){
                var file = files[i], path = file.path, oname = name = file.name, targetpath =util.upfile_root, url = util.upfile_url_bas;
                if(util.upfile_exts.indexOf( name.split('.')[name.split('.').length - 1].toLocaleLowerCase() ) == -1){
                    res.send({error: '您上传的文件不在允许范围内'});
                    return;
                }
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
        },
        'method': 'post'
    }
]

for(var i=0; i<routedefines.length; i++){
    var handle = (function bb(i){
        var handler = routedefines[i].handler;
        var method = routedefines[i].method;
        var path = routedefines[i].pathname;
        return function (req, res){
            try{
                logger.info('action ' + routedefines[i].pathname + ' start......');
                for(var k in req.body){
                    logger.info('param ' + k + '=' + req.body[k]);
                }
                for(var k in req.query){
                    logger.info('param ' + k + '=' + req.query[k]);
                }
                handler(req, res);
            }catch(e){
                logger.info(e);
                logger.info(e.stack);
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
    logger.info('Express server listening on port ' + app.get('port'));
});