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
    queryCounselor:function(userInfo,callback,onerror){
        var sql = 'SELECT * FROM tb_userinfo WHERE uid=\'' + userInfo.uid + '\'';
        JDB.query(sql, function(err, vals, fields){
            if(err){
                logger.info(JSON.stringify(err));
                onerror && onerror(err);
            }
            callback&& callback(err, vals, fields);
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
        var msg = "创建失败",msg_error = "顾问已存在，请不要重复创建";
            this.queryCounselor(userInfo,function(err, vals, fields){//查询是否唯一
                if(!err&&(!vals || vals.length==0)){
                    JDB.oper(sql, function(result){//创建用户
                        if(result&&!result.message){
                            logger.info(JSON.stringify(result));
                            //callback({"code":"10001","msg":msg});
                            self.createCGroup(userInfo,function(c_g_r){
                                if(c_g_r&&!c_g_r.message){
                                    var new_arr=[];
                                    //再根据uid 查询
                                    self.queryGroupByOwer(userInfo.uid,function(err, all_group, fields){

                                        if(err){
                                            callback({"code":"10002","msg":(err?err.message:msg)});
                                        }else{
                                            for(i in all_group){
                                                new_arr.push({"group_name":all_group[i].groupname,"group_id":all_group[i].groupnum, "type": all_group[i].grouptype});
                                            }
                                            callback({"code":"10001","list":new_arr});
                                        }

                                    });

                                }else{
                                    logger.error('create Invalid');
                                    callback({"code":"10002","msg":(err?err.message:msg)});
                                }
                            },function(err){//创建顾问相关群组失败
                                logger.error('create Invalid');
                                callback({"code":"10002","msg":(err?err.message:msg)});
                            });
                        }else{
                            logger.error('create Invalid');
                            callback({"code":"10002","msg":(err?err.message:msg)});
                        }

                    });
                }else{
                    callback({"code":"10002","msg":(err?err.message:msg_error)});
                }

            });

    },
    /**
     * 创建顾问所关联的群组
     * @param userInfo
     * @param callback
     */
    createCGroup: function(userInfo, callback,onerror){
        var sql , msg , msg_error ,self=this,admin_id=1;

        //admin_id 为顾问群的拥有者的ID暂定为1,根据这个id查询组信息
        self.queryGroupByOwer(admin_id,function(err, group, fields){
            if(err){
                logger.info(JSON.stringify(err));
                onerror && onerror(err);
            }else{
                sql =["INSERT INTO tb_grouplist (owner, ownername, ownercname, groupname, grouptype, groupnum) VALUES ("+userInfo.uid+", '"+userInfo.uname+"', '"+userInfo.uname+"', '"+(userInfo.uname+"客户群")+"', 2, '"+(userInfo.uid+"_"+Math.floor(Math.random()*(10000000000-1000+1)+1000))+"')",
                    "INSERT INTO tb_grouplist (owner, ownername, ownercname, groupname, grouptype, groupnum) VALUES ("+userInfo.uid+", '"+userInfo.uname+"', '"+userInfo.uname+"', '"+(userInfo.uname+"经理群")+"',3, '"+(userInfo.uid+"_"+Math.floor(Math.random()*(10000000000-1000+1)+1000))+"')",
                    "INSERT INTO tb_group_userlist (userid, username, usercname, usertype, groupid, jointime) VALUES ("+userInfo.uid+", '"+userInfo.uname+"', '"+userInfo.uname+"', 3,'"+group[0].id+"', '"+_util.dateFormat("yyyy-MM-dd hh:mm:ss")+"')",
                    "INSERT INTO tb_contacthistory_list (user, toid, totype, lastchattime) VALUES ('"+userInfo.uid+ "','" + group[0].id+ "','2', null)"
                ] ;

                JDB.oper(sql, function(result){
                    logger.info("创建自己群");
                    if(result&&!result.message){
                        self.queryGroupByOwer(userInfo.uid,function(err, group, fields){//查询顾问自己的群
                            logger.info("查询顾问自己的群");
                            if(err){
                                logger.info(JSON.stringify(err));
                                onerror && onerror(err);
                            }else{

                                sql =[
                                    "INSERT INTO tb_group_userlist (userid, username, usercname, usertype, groupid, jointime) VALUES ("+userInfo.uid+", '"+userInfo.uname+"', '"+userInfo.uname+"', 3,'"+group[0].id+"', '"+_util.dateFormat("yyyy-MM-dd hh:mm:ss")+"')",
                                    "INSERT INTO tb_group_userlist (userid, username, usercname, usertype, groupid, jointime) VALUES ("+userInfo.uid+", '"+userInfo.uname+"', '"+userInfo.uname+"', 3,'"+group[1].id+"', '"+_util.dateFormat("yyyy-MM-dd hh:mm:ss")+"')",
                                    "INSERT INTO tb_contacthistory_list (user, toid, totype, lastchattime) VALUES ('"+userInfo.uid+ "','" + group[0].id+ "','2', null)",
                                    "INSERT INTO tb_contacthistory_list (user, toid, totype, lastchattime) VALUES ('"+userInfo.uid+ "','" + group[1].id+ "','2', null)"
                                ] ;

                                JDB.oper(sql, function(result){//加入自己的群
                                    logger.info("加入自己的群");
                                    if(result&&!result.message){
                                        callback(result);
                                    }else{
                                        onerror && onerror(result);
                                    }

                                });
                            }

                        });
                    }else{
                        onerror && onerror(result);
                    }

                });
            }


        });

    },

    /**
     * 根据owner 查询组信息
     * @param ower_id
     * @param callback
     */
    queryGroupByOwer:function(ower_id,callback,onerror){
        var sql = 'SELECT * FROM tb_grouplist WHERE owner=\'' + ower_id + '\'';
        JDB.query(sql, function(err, vals, fields){
            if(err){
                logger.info(JSON.stringify(err));
                onerror && onerror(err);
            }
            callback&&callback(err, vals, fields);
        });
    }
};

module.exports=CounselorService;