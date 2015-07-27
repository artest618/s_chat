/*
Navicat MySQL Data Transfer

Source Server         : local
Source Server Version : 50520
Source Host           : localhost:3306
Source Database       : chat

Target Server Type    : MYSQL
Target Server Version : 50520
File Encoding         : 65001

Date: 2015-07-27 23:00:50
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
  `grouptype` int(2) NOT NULL COMMENT '群类型',
  `groupnum` varchar(32) NOT NULL COMMENT '群号？',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='所有群列表';

-- ----------------------------
-- Records of tb_grouplist
-- ----------------------------

-- ----------------------------
-- Table structure for tb_group_userlist
-- ----------------------------
DROP TABLE IF EXISTS `tb_group_userlist`;
CREATE TABLE `tb_group_userlist` (
  `id` int(32) NOT NULL,
  `userid` int(9) NOT NULL COMMENT '用户ID',
  `username` varchar(32) NOT NULL COMMENT '用户名称',
  `usercname` varchar(32) DEFAULT NULL COMMENT '中文名称',
  `usertype` int(2) NOT NULL COMMENT '用户类型',
  `groupid` int(2) NOT NULL COMMENT '群ID',
  `jointime` datetime NOT NULL COMMENT '加入时间',
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='群成员列表';

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
  `usertype` int(2) NOT NULL COMMENT '用户类型 1.普通用户 2.顾问',
  `headicon` varchar(1024) DEFAULT 'images/headers/default.png' COMMENT '头像',
  `groupcount` int(2) unsigned zerofill DEFAULT '00' COMMENT '拥有群数',
  `createdate` datetime NOT NULL COMMENT '创建时间',
  `delflag` int(1) DEFAULT '1' COMMENT '删除标记 0 代表已删除 1代表未删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COMMENT='用户信息表';

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
