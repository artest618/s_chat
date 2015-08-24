define("common", ['jquery'], function($){
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
        },
        emojis: [
            {
                code: '/88',
                path: '../images/emoji/88.jpg'
            },
            {
                code: '/bomb',
                path: '../images/emoji/bomb.jpg'
            }, {
                code: '/bsmile',
                path: '../images/emoji/bsmile.jpg'
            },
            {
                code: '/cry',
                path: '../images/emoji/cry.jpg'
            },
            {
                code: '/fuck',
                path: '../images/emoji/fuck.jpg'
            },
            {
                code: '/hellokitty',
                path: '../images/emoji/hellokitty.jpg'
            },
            {
                code: '/hsmile',
                path: '../images/emoji/hsmile.jpg'
            },
            {
                code: '/idwts',
                path: '../images/emoji/idwts.jpg'
            },
            {
                code: '/idwtsy',
                path: '../images/emoji/idwtsy.jpg'
            },
            {
                code: '/kiss',
                path: '../images/emoji/kiss.jpg'
            },
            {
                code: '/qq88',
                path: '../images/emoji/qq88.jpg'
            },
            {
                code: '/sad',
                path: '../images/emoji/sad.jpg'
            },
            {
                code: '/sexy',
                path: '../images/emoji/sexy.jpg'
            },
            {
                code: '/smile',
                path: '../images/emoji/smile.jpg'
            },
            {
                code: '/ssmile',
                path: '../images/emoji/ssmile.jpg'
            },
            {
                code: '/wcis',
                path: '../images/emoji/wcis.jpg'
            }
        ],
        formatMsgDisp: function(msg){
            msg = msg.replace(/\n/g, '<br />');
            for(var i in this.emojis){
                var reg = new RegExp('\\' + this.emojis[i].code, 'g');
                msg = msg.replace(reg, '<img src="' + this.emojis[i].path + '" style="width:26px;height:26px;">');
            }
            return msg;
        },
        formatFileMsg: function(msg){
            var ext = msg.file.split('.'), ext = ext[ext.length - 1];
            return msg = new EJS({url: 'views/tmpls/filemessage.ejs'}).render({
                url: msg.url,
                ficon: _t.filetypeicon[_t.getFileTypeByExt(ext)],
                file: msg.file
            });
        },
        upfiletypes: {
            'image': ['png', 'jpg', 'jpeg', 'bmp', 'gif'],
            'office': ['doc', 'docs', 'xls', 'xlsx', 'ppt', 'pptx'],
            'zipfile': ['rar', 'zip', 'tar', '7z']
        },
        getFileTypeByExt: function(ext){
            for(var k in _t.upfiletypes){
                if(_t.upfiletypes[k].indexOf(ext) != -1){
                    return k;
                }
            }
            return 'unkown';
        },
        filetypeicon: {
            'image': '../images/image.png',
            'office': '../images/office.jpeg',
            'zipfile': '../images/zip.png',
            'unkown': '../images/file.png'
        },
        upfile: function(){
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){

            }
        }
    }
});