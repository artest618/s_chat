/**
 * Created by tony on 15-7-26.
 */
var JDB=require("../mysqldbfactory.js");
var util=require("../util.js");

/**
 * 顾问相关信息
 * @type {{createCounselor: createCounselor, createC: createC}}
 */

var CounselorService = {
    /**
     * 根据顾问ID 查询是否已经存在
     * @param userInfo  {uid,uname}
     * @param callback
     */
    queryCounselor:function(userInfo,callback){
        var sql = 'SELECT * FROM TB_USERINFO WHERE UID=\'' + userInfo.uid + '\'';
        JDB.query(sql, function(err, vals, fields){
            callback(vals);
        });
    },
    /**
     * 创建顾问
     * @param userInfo {uid,uname}
     * @param callback
     */
    createCounselor: function(userInfo, callback){

        var sql = "INSERT INTO TB_USERINFO (uid, name, cname, usertype, groupcount, createdate)  VALUES ("+userInfo.uid+", '"+userInfo.uname+"', '"+userInfo.uname+"', 2, 3, '"+util.dateFormat("yyyy-MM-dd hh:mm:ss")+"')";
        var msg="创建成功",msg_error="顾问已存在，请不要重复创建";
        this.queryCounselor(userInfo,function(vals){
            if(vals.length==0){
                JDB.oper(sql, function(result){
                    if(result){
                        console.log(JSON.stringify(result));
                        callback({"code":"10001","msg":msg});
                    }else{
                        console.log('insert successfully,affected 4 rows.')
                    }

                });
            }else{
                callback({"code":"10002","msg":msg_error});
            }

        });

    },
    /**
     * 创建顾问所关联的群组
     * @param name
     * @param callback
     */
    createCGroup: function(name, callback){

    },
    /**
     * 加入顾问群
     */
    joinCounselors:function(){

    }
};

module.exports=CounselorService;