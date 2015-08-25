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

        //data = q.stringify(data);

    },
    checkSigned: function(uid, callback){
         //return callback(true);
        var path = '/webservice/users/queryuser.htm?userId=' + uid;
        console.log('check user if signed with uid:' + uid);
        util.sendRequest(path, '', function(stat, result){
            console.log('checked userinfo from foreign system:' + JSON.stringify(result));
            if(stat == 200){
                if(typeof result == 'string'){
                    result = JSON.parse(result);
                }
                if(result.code != 'SINO000000'){
                    callback(false);
                    return;
                }
                var usertype = result.userEdit.userRole == 1 ? 1 : result.userEdit.userRole == 2 ? 2 : 3;
                var user = {
                    name: result.userEdit.userName,
                    uid: result.userEdit.userId,
                    cname: result.userEdit.userName,
                    usertype: usertype,
                    headicon: result.userEdit.userImg
                }

                callback(user);
            }else{
                callback(false);
            }
        });
    }
}

module.exports=FI;