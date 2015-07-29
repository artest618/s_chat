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
            data: {'name': '1111'},
            sucess: function(data){
                app.user = data;
            },
            error: function(err){

            }
        });

        Common.post({

        })
    });
});

