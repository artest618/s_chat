/**
 * Created by tony on 15-7-26.
 */
var http = require('http');
var _util={};
    /**
     *
     * 对Date的扩展，将 Date 转化为指定格式的String
     * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
     * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
     * 例子：
     * (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
     * (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
     * @param fmt
     */
    _util.dateFormat=function(fmt, date){
        var curr = date && new Date(date) || new Date();

        Date.prototype.Format = function (fmt) {
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        };
        return curr.Format(fmt);
        //curr = new Date().Format(fmt);
        //return curr;
    };

    _util.isMobile = function(req){
        var ua = req.headers['user-agent'];
        console.log(ua);
        return /(android)|(Android)|(ios)|(IOS)|(iPhone)|(ipad)|(iPad)|(Windows Phone)/.test(ua);
    };

    //每用户最多可加群数量
    _util.maxGrpPerUser = 5;

    //用户消息存储根目录
    _util.msgroot = 'msgdata/';

    //文件上传根目录
    _util.upfile_root = 'client/upfiles/';
    //文件上传后根目录对应的url
    _util.upfile_url_bas = 'upfiles/';
    _util.upfile_exts = ['png', 'gif', 'jpg', 'jpeg', 'bmp', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rar', 'zip', 'tar', '7z'];

    //存储聊天记录的文件，单个文件的最大大小
    //如果最后一条消息的大小特别大，文件实际大小可能会超过该值
    _util.msgfileMaxSize = 102400;

    //外部接口配置
    //http://120.131.68.151:8071/webservice/users/queryuser.htm?userId=374
    _util.fifset = {
        method: "POST",
        host: "120.131.68.151",
        port: 8071,
        path: "",
        headers: {
            //"Content-Type": 'application/x-www-form-urlencoded',
            "Content-Type": 'application/json',
            "Content-Length": 0
        }
    };

    _util.sendRequest = function(path, data, callback){
        data = JSON.stringify(data);
        _util.fifset.headers['Content-Length'] = data.length;
        _util.fifset.path = path;
        var req = http.request(_util.fifset, function(serverFeedback){
            if (serverFeedback.statusCode == 200) {
                var body = "";
                serverFeedback.on('data', function (data) {
                    body += data;
                }).on('end', function () {
                    callback(200, body);
                });
            }
            else {
                callback(500, {'error': '服务器返回错误'});
            }
        });
        req.write(data);
        req.end();
    }
module.exports=_util;
