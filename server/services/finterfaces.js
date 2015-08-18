var http = require('http');
var util = require('../_util');
//var q = require('querystring');

var FI = {
    syncUser: function(uid, callback){
        var tmpl = ['丁聪', '华夏', '潇琦', '帛员', '蝶妃', '江浩','华田','曹娅','娴红',
            '宇旺', '孔良', '超许','娇翔','庞三',' 妍陈','莲眉','冉迪','振崔','子希'];
        var tmp2 =['张','王','李','赵','吴','郑','周','赵','孙','钱'];
        var name_r=tmp2[Math.floor(tmp2.length * Math.random())]+tmpl[Math.floor(tmpl.length * Math.random())];
        return {
            name: 'Zhang San' + parseInt(Math.random()*0xffffff),
            uid: parseInt(Math.random()*0xffffff),
            cname: name_r,
            usertype: '1',
            headicon: 'images/headers/default.png'
        };
        var data = {uid: uid};
        util.sendRequest('/syncUser', data, function(stat, result){
            if(stat == 200){
                callback(result);
            }else{
                callback(false);
            }
        });
        //data = q.stringify(data);

    },
    checkSigned: function(uid){
        return true;
    }
}

module.exports=FI;