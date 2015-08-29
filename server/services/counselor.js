/**
 * Created by tony on 15-7-26.
 */
var JDB=require("../mysqldbfactory.js");
var _util=require("../_util.js");
var logger = require('../logger').logger;

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
        var sql = 'SELECT * FROM tb_userinfo WHERE uid=\'' + userInfo.uid + '\'';
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
        var self= this;
        var sql = "INSERT INTO tb_userinfo (uid, name, cname, usertype, groupcount, createdate ,headicon)  " +
                  "VALUES ("+userInfo.uid+", '"+userInfo.uname+"', '"+userInfo.uname+"', 3, 3, '"+_util.dateFormat("yyyy-MM-dd hh:mm:ss")+"' ,'')";
        var msg = "创建成功",msg_error = "顾问已存在，请不要重复创建";
            this.queryCounselor(userInfo,function(vals){
                if(!vals || vals.length==0){
                    JDB.oper(sql, function(result){
                        if(result){
                            logger.info(JSON.stringify(result));
                            //callback({"code":"10001","msg":msg});
                            self.createCGroup(userInfo,function(c_g_r){
                                if(c_g_r){
                                    var new_arr=[];
                                    //再根据uid 查询
                                    self.queryGroupByOwer(userInfo.uid,function(all_group){
                                        for(i in all_group){
                                            new_arr.push({"group_name":all_group[i].groupname,"group_id":all_group[i].groupnum, "type": all_group[i].grouptype});
                                        }
                                        callback({"code":"10001","list":new_arr});
                                    });

                                }else{
                                    logger.error('create Invalid');
                                }
                            });
                        }else{
                            logger.error('create Invalid');
                        }

                    });
                }else{
                    callback({"code":"10002","msg":msg_error});
                }

            });

    },
    /**
     * 创建顾问所关联的群组
     * @param userInfo
     * @param callback
     */
    createCGroup: function(userInfo, callback){
        var sql , msg , msg_error ,self=this,admin_id=1;

        //admin_id 为顾问群的拥有者的ID暂定为1,根据这个id查询组信息
        self.queryGroupByOwer(admin_id,function(group){

            sql =["INSERT INTO tb_grouplist (owner, ownername, ownercname, groupname, grouptype, groupnum) VALUES ("+userInfo.uid+", '"+userInfo.uname+"', '"+userInfo.uname+"', '"+(userInfo.uname+"的客户群")+"', 2, '"+(userInfo.uid+"_"+Math.floor(Math.random()*(10000000000-1000+1)+1000))+"')",
                "INSERT INTO tb_grouplist (owner, ownername, ownercname, groupname, grouptype, groupnum) VALUES ("+userInfo.uid+", '"+userInfo.uname+"', '"+userInfo.uname+"', '"+(userInfo.uname+"的客户经理群")+"',3, '"+(userInfo.uid+"_"+Math.floor(Math.random()*(10000000000-1000+1)+1000))+"')",
                "INSERT INTO tb_group_userlist (userid, username, usercname, usertype, groupid, jointime) VALUES ("+userInfo.uid+", '"+userInfo.uname+"', '"+userInfo.uname+"', 3,'"+group[0].id+"', '"+_util.dateFormat("yyyy-MM-dd hh:mm:ss")+"')",
                "INSERT INTO tb_contacthistory_list (user, toid, totype, lastchattime) VALUES ('"+userInfo.uid+ "','" + group[0].id+ "','2', null)"
            ] ;

            JDB.oper(sql, function(result){

                self.queryGroupByOwer(userInfo.uid,function(group){

                    sql =[
                        "INSERT INTO tb_group_userlist (userid, username, usercname, usertype, groupid, jointime) VALUES ("+userInfo.uid+", '"+userInfo.uname+"', '"+userInfo.uname+"', 3,'"+group[0].id+"', '"+_util.dateFormat("yyyy-MM-dd hh:mm:ss")+"')",
                        "INSERT INTO tb_group_userlist (userid, username, usercname, usertype, groupid, jointime) VALUES ("+userInfo.uid+", '"+userInfo.uname+"', '"+userInfo.uname+"', 3,'"+group[1].id+"', '"+_util.dateFormat("yyyy-MM-dd hh:mm:ss")+"')",
                        "INSERT INTO tb_contacthistory_list (user, toid, totype, lastchattime) VALUES ('"+userInfo.uid+ "','" + group[0].id+ "','2', null)",
                        "INSERT INTO tb_contacthistory_list (user, toid, totype, lastchattime) VALUES ('"+userInfo.uid+ "','" + group[1].id+ "','2', null)"
                    ] ;

                    JDB.oper(sql, function(result){
                        callback(result);
                    });

                });

            });

        });

    },

    /**
     * 根据owner 查询组信息
     * @param ower_id
     * @param callback
     */
    queryGroupByOwer:function(ower_id,callback){
        var sql = 'SELECT * FROM tb_grouplist WHERE owner=\'' + ower_id + '\'';
        JDB.query(sql, function(err, vals, fields){
            callback(vals);
        });
    }
};

module.exports=CounselorService;