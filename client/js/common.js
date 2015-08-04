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
        formatDate: function(date){
            return date.getYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + ' ' +
                date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        }
    }
});