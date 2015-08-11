define("common", ['zepto'], function($){
    var _t;
    return _t = {
        processing: 0,
        post: function(params){
            var p = params;
            $.ajax({
                url: p.url || '',
                type: p.method || 'post',
                data: p.data,
                success: function(data){
                    if(data.error){
                        alert(data.error);
                        return;
                    }
                    p.success(data);
                },
                beforeSend: function(xhr){
                    _t.processing++;
                    if(_t.processing <= 1){
                        _t.showLoading();
                    }
                },
                error: function(xhr, status, err){
                    p.error(err);
                },
                complete: function(xhr, status){
                    _t.processing--;
                    setTimeout(function(){
                        if(_t.processing <= 0){
                            _t.hideLoading();
                        }
                    }, 1);
                }
            });
        },
        showLoading: function(){
            $("body").prepend("<div id='loaddingmask' style='width:100%;height:100%;position: fixed;z-index: 999;'><div style='width:100%;height:100%;opacity: 0.5;position:fixed;background-color:white;'></div>" +
                "<img src='../images/loading.gif' style='top:20%; left: 48%;position:relative;' /></div>")
        },
        hideLoading: function(){
            $('#loaddingmask').remove();
        },
        urlparams: (function(){
            var str = '{"' + window.location.search.replace(/\?/,'').replace(/&/g, '","').replace(/=/g, '":"') + '"}';
            var up = JSON.parse(str);
            console.log(up);
            return up;
        })(),
        formatDate: function(date, fmt){
            var curr = date && new Date(date) || new Date();
            fmt = fmt || 'yyyy-MM-dd hh:mm:ss';

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
        }
    }
});