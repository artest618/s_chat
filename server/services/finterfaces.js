var http = require('http');
var util = require('../_util');
var logger = require('../logger').logger;
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
    userPhoneFamat:function(phone){
       return  phone.substr(0,3)+"****"+phone.substr(7,10);
    },
    checkSigned: function(uid, callback){
        //return callback(true);
        var path = '/webservice/users/queryuser.htm?userId=' + uid;
        logger.info('check user if signed with uid:' + uid);
        util.sendRequest(path, '', function(stat, result){
            logger.info('checked userinfo from foreign system:' + JSON.stringify(result));
            if(stat == 200){
                if(typeof result == 'string'){
                    result = JSON.parse(result);
                }
                if(result.code != 'SINO000000'){
                    callback({error: "您还未登录系统或无权限进入聊天，请在登录页面进行登录！"});
                    return;
                }
               // var usertype = result.userEdit.userRole == 1 ? 1 : result.userEdit.userRole == 2 ? 2 : 3;


                var userRole = result.userEdit.userRole;

                if(userRole == 1||userRole ==3){
                    usertype = 1;
                }else if(userRole == 2||userRole == 6){
                    usertype = 2;
                }else if(userRole == 4){
                    usertype = 3
                }else if(userRole ==5) {
                    callback({error: '签约经理无权限进行聊天。'});
                    return;
                }else{
                    usertype = 1;
                }
                //var user = {
                //    name: (result.userEdit.userName||userPhoneFamat(result.userEdit.userPhone||"")),
                //    uid: result.userEdit.userId,
                //    cname: (result.userEdit.userName||userPhoneFamat(result.userEdit.userPhone||"")),
                //    usertype: usertype,
                //    headicon: result.userEdit.userImg
                //}
                var phone =result.userEdit.userPhone||"12345678901";
                //var cName = (result.userEdit.userName&&(result.userEdit.userName.substr(0,1)+"经理"))||"";
                var user = {
                    name: (result.userEdit.userName||(phone.substr(0,3)+"****"+phone.substr(7,10))),
                    uid: result.userEdit.userId,
                    cname: (result.userEdit.userName||(phone.substr(0,3)+"****"+phone.substr(7,10))),
                    usertype: usertype,
                    headicon: result.userEdit.userImg
                }
                callback(user);
            }else{
                callback({error: '您还未登录系统或无权限进入聊天，请在登录页面进行登录！'});
            }
        });
    },
    getProductInfo: function(pid, callback){
        var res = {
            "code":"SINO000000","message":"查询成功",
            "proEdit":{
                "applicationCondition":"1111",
                "auditReason":"",
                "cardLevel":"1",
                "costOf":"11",
                "creditRequire":0,
                "currentFee":12.00,
                "custom1":"你好单位否",
                "custom2":"你好单位否",
                "custom3":"你好单位否",
                "designatedAdvisor":1,
                "endTime":0,
                "endTimeCh":"",
                "financeType":"",
                "identity":0,
                "institution":"",
                "institutionId":0,
                "isAudit":1,
                "isNeedCar":0,
                "isNeedRoom":0,
                "isRecommend":0,
                "loanLimit":11.00,
                "loanLimitMax":23.00,
                "loanPeriod":1,
                "localInsurance":0,
                "localProvidentFund":0,
                "monthRate":11.00,
                "monthRateEnd":0,
                "needService":0,
                "productCharacteristic":"11111",
                "productId":4,
                "productIgUrl":"http://anliangfile1.7zhibao.com/www/advertise/12/2015/08/05/19/016957/1438774917840.jpg",
                "productName":"产品名称",
                "productNumber":"1001",
                "productType":1,
                "productWeight":0,
                "publishTime":0,
                "publishTimeCh":"",
                "rate":11.00,
                "remark":"sssss",
                "repayDescript":"啊啊啊",
                "repayMethod":"1",
                "requiredMaterials":"111",
                "returnFee":"啊啊啊",
                "stageRate":23.00,
                "status":2,
                "supportHouse":0,
                "telephone":"13333333333",
                "webSite":"",
                "yearFee":"22"
            }
        };
        //return callback(res.proEdit);
        var path = '/webservice/appproduct/queryproedit_app.htm?productId=' + pid;
        logger.info('get product ' + pid + ' info from foreign system');
        util.sendRequest(path, '', function(stat, result){
            logger.info('got product info from foreign system:' + JSON.stringify(result));
            if(stat == 200 && result){
                if(typeof result == 'string'){
                    result = JSON.parse(result);
                }
                if(result.code != 'SINO000000'){
                    callback(false);
                    return;
                }
                var product = result.result.product;
                callback(product);
            }else{
                callback(false);
            }
        });
    }
}

module.exports=FI;