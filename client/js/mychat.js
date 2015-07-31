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
            },
            error: function(err){

            }
        });

        Common.post({
            url: '/chatList',
            data: {},
            success: function(data){
                if(data.length < 0){

                }
            },
            error: function(err){}
        })
    });
});

