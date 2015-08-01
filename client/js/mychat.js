"use strict";

define('zepto', ['../js/zepto'], function(){
    return Zepto;
});

require.config({
    baseUrl: '../js',
    waitSeconds: 30,
    paths: {
        domReady: "domReady",
        ejs: "ejs",
        common: "common"
    }
});

var app = {};

require(['zepto', 'common', 'domReady', 'ejs'], function($, Common, $dom, EJS){
    $dom(function(){
        Common.post({
            url: '/getUserInfo',
            data: {tid: Common.urlparams.tid},
            success: function(data){
                app.users = data;
                initChatList();
            },
            error: function(err){

            }
        });
    });

    function initChatList(){
        Common.post({
            url: '/chatList',
            data: {},
            success: function(data){
                //var a = {
                //    "user": 3631549,
                //    "toid": 7788872,
                //    "totype": 1,
                //    "lastchattime": "2015-08-01T06:47:13.000Z",
                //    "id": 12,
                //    "uid": "007788872",
                //    "name": "Zhang San5429276",
                //    "cname": "ÕÅÈý",
                //    "usertype": 1,
                //    "headicon": "../images/icon/mail.png",
                //    "groupcount": "00",
                //    "createdate": "2015-08-01T03:49:37.000Z",
                //    "delflag": 0
                //}
                var ejs = new EJS({url: "views/tmpls/contactlist.ejs"}).render({data: data});
                $(".contactlistview").html(ejs);
            },
            error: function(err){}
        })
    }
});

