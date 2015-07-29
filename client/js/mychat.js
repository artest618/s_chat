"use strict";

define('zepto', ['../js/zepto'], function($){
    return $;
});

require.config({
    baseUrl: '../js',
    waitSeconds: 30,
    paths: {
        domReady: "domReady",
        ejs: "ejs"
    }
});

require(['zepto', 'domReady', 'ejs'], function($, $dom, EJS){
    $dom(function(){
        alert('ss');
    });
});

