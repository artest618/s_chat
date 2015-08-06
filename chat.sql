/*
Navicat MySQL Data Transfer

Source Server         : local
Source Server Version : 50520
Source Host           : localhost:3306
Source Database       : chat

Target Server Type    : MYSQL
Target Server Version : 50520
File Encoding         : 65001

Date: 2015-07-28 23:39:23
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for tb_grouplist
-- ----------------------------
DROP TABLE IF EXISTS `tb_grouplist`;
CREATE TABLE `tb_grouplist` (
  `id` int(9) NOT NULL AUTO_INCREMENT,
  `owner` int(9) NOT NULL COMMENT '所有者ID',
  `ownername` varchar(32) NOT NULL COMMENT '所有者名称',
  `ownercname` varchar(16) NOT NULL COMMENT '所有者中文名称',
  `groupname` varchar(64) NOT NULL COMMENT '群名称',
  `grouptype` int(2) NOT NULL COMMENT '群类型 1.顾问群2.客户群3.客户经理群',
  `groupnum` varchar(32) NOT NULL COMMENT '群号？',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8 COMMENT='所有群列表';

-- ----------------------------
-- Records of tb_grouplist
-- ----------------------------
INSERT INTO `tb_grouplist` (owner, ownername, ownercname, groupname, grouptype, groupnum) VALUES (1, '管理员', '管理员', '顾问群', '1', '1_1000');

-- ----------------------------
-- Table structure for tb_group_userlist
-- ----------------------------
DROP TABLE IF EXISTS `tb_group_userlist`;
CREATE TABLE `tb_group_userlist` (
  `id` int(32) NOT NULL AUTO_INCREMENT,
  `userid` int(9) NOT NULL COMMENT '用户ID',
  `username` varchar(32) NOT NULL COMMENT '用户名称',
  `usercname` varchar(32) DEFAULT NULL COMMENT '中文名称',
  `usertype` int(2) NOT NULL COMMENT '用户类型',
  `groupid` int(2) NOT NULL COMMENT '群ID',
  `jointime` TIMESTAMP COMMENT '加入时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='群成员列表';

-- ----------------------------
-- Records of tb_group_userlist
-- ----------------------------

-- ----------------------------
-- Table structure for tb_userinfo
-- ----------------------------
DROP TABLE IF EXISTS `tb_userinfo`;
CREATE TABLE `tb_userinfo` (
  `id` int(9) NOT NULL AUTO_INCREMENT,
  `uid` int(9) unsigned zerofill NOT NULL COMMENT '用户ID',
  `name` varchar(32) NOT NULL COMMENT '用户名称',
  `cname` varchar(16) NOT NULL COMMENT '中文名称',
  `usertype` int(2) NOT NULL COMMENT '用户类型 1.客户2.客户经理3.顾问',
  `headicon` varchar(1024) DEFAULT 'images/headers/default.png' COMMENT '头像',
  `groupcount` int(2) unsigned zerofill DEFAULT '00' COMMENT '拥有群数',
  `createdate` TIMESTAMP COMMENT '创建时间',
  `delflag` int(1) DEFAULT '0' COMMENT '删除标记 0 代表未删除 1代表已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COMMENT='用户信息表';

-- ----------------------------
-- Records of tb_userinfo
-- ----------------------------

-- ----------------------------
-- Table structure for tb_usertype
-- ----------------------------
DROP TABLE IF EXISTS `tb_usertype`;
CREATE TABLE `tb_usertype` (
  `id` int(2) NOT NULL AUTO_INCREMENT,
  `usertype` varchar(32) NOT NULL,
  `maxgroup` int(2) DEFAULT '5',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户类型表';

-- ----------------------------
-- Records of tb_usertype
-- ----------------------------

-- ----------------------------
-- Table structure for tb_contacthistory_list
-- ----------------------------
DROP TABLE IF EXISTS `tb_contacthistory_list`;
CREATE TABLE `tb_contacthistory_list`(
  `user` int(9) NOT NULL COMMENT '用户ID',
  `toid` int(9) NOT NULL COMMENT '聊天对象id',
  `totype` int(2) NOT NULL COMMENT '聊天对象类型 1为顾问/客户 2为群',
  `lastchattime` TIMESTAMP  COMMENT '最后一次聊天时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='聊天列表'
