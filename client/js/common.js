define("common", ['zepto'], function($){
    var _t;
    return _t = {
        processing: 0,
        post: function(params){
            $.ajax({
                url: params.url || '',
                type: params.method || 'post',
                data: params.data,
                success: function(data){
                    params.success(data);
                },
                beforeSend: function(xhr){
                    _t.processing++;
                    if(_t.processing <= 1){
                        _t.showLoading();
                    }
                },
                error: function(xhr, status, err){
                    params.error(err);
                },
                complete: function(xhr, status){
                    _t.processing--;
                    setTimeout(function(){
                        if(_t.processing > 0){
                            _t.hideLoading();
                        }
                    }, 500);
                }
            });
        },
        showLoading: function(){
            $("body").append("<div id='loaddingmask'><div style='width:100%;height:100%;opacity: 0.5;position:fixed;background-color:white;z-index: 998;'></div>" +
                "<img src='../images/loading.gif' style='position:fixed;top:20%;margin: 0 auto;z-index: 999;' /></div>")
        },
        hideLoading: function(){
            $("body").removeChild($("#loaddingmask"));
        }
    }
});