var log4js = require('log4js');

log4js.configure({
    appenders: [
        {
            type: 'console',
            category: "console"
        }, //控制台输出
        {
            type: "dateFile",
            filename: 'logs/access.log',
            pattern: "yyyy-MM-dd",
            alwaysIncludePattern: false,
            category: 'dateFileLog'
        }//日期文件格式
    ],
    replaceConsole: true,   //替换console.log
    levels:{
        dateFileLog: 'debug'
    }
});

var dateFileLog = log4js.getLogger('dateFileLog');

dateFileLog.use = function(app) {
    //页面请求日志,用auto的话,默认级别是WARN
    //app.use(log4js.connectLogger(dateFileLog, {level:'auto', format:':method :url'}));
    app.use(log4js.connectLogger(dateFileLog, {level:'debug', format:':method :url'}));
}

exports.logger = dateFileLog;