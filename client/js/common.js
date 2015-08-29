define("common", ['jquery'], function($){
    var _t;
    return _t = {
        processing: 0,
        post: function(params){
            var p = params;
            $.ajax({
                url: p.url || '',
                type: p.method || 'post',
                data: p.data,
                success: function(data){
                    if(data.error){
                        alert(data.error);
                        return;
                    }
                    p.success(data);
                },
                beforeSend: function(xhr){
                    _t.processing++;
                    if(_t.processing <= 1){
                        _t.showLoading();
                    }
                },
                error: function(xhr, status, err){
                    p.error(err);
                },
                complete: function(xhr, status){
                    _t.processing--;
                    setTimeout(function(){
                        if(_t.processing <= 0){
                            _t.hideLoading();
                        }
                    }, 1);
                }
            });
        },
        showLoading: function(){
            $("body").prepend("<div id='loaddingmask' style='width:100%;height:100%;position: fixed;z-index: 999;'><div style='width:100%;height:100%;opacity: 0.5;position:fixed;background-color:white;'></div>" +
                "<img src='../images/loading.gif' style='top:20%; left: 48%;position:relative;' /></div>")
        },
        hideLoading: function(){
            $('#loaddingmask').remove();
        },
        urlparams: (function(){
            var str = '{"' + window.location.search.replace(/\?/,'').replace(/&/g, '","').replace(/=/g, '":"') + '"}';
            var up = JSON.parse(str);
            return up;
        })(),
        formatDate: function(date, fmt){
            var curr = date && new Date(date) || new Date();
            fmt = fmt || 'yyyy-MM-dd hh:mm:ss';

            Date.prototype.Format = function (fmt) {
                var o = {
                    "M+": this.getMonth() + 1, //月份
                    "d+": this.getDate(), //日
                    "h+": this.getHours(), //小时
                    "m+": this.getMinutes(), //分
                    "s+": this.getSeconds(), //秒
                    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                    "S": this.getMilliseconds() //毫秒
                };
                if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (var k in o)
                    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                return fmt;
            };
            return curr.Format(fmt);
            //curr = new Date().Format(fmt);
            //return curr;
        },
        emojis: [
            {
                code: '/88',
                path: '../images/emoji/88.png'
            },
            {
                code: '/bomb',
                path: '../images/emoji/bomb.png'
            }, {
                code: '/bsmile',
                path: '../images/emoji/bsmile.png'
            },
            {
                code: '/cry',
                path: '../images/emoji/cry.png'
            },
            {
                code: '/fuck',
                path: '../images/emoji/fuck.png'
            },
            {
                code: '/hellokitty',
                path: '../images/emoji/hellokitty.png'
            },
            {
                code: '/hsmile',
                path: '../images/emoji/hsmile.png'
            },
            {
                code: '/idwts',
                path: '../images/emoji/idwts.png'
            },
            {
                code: '/idwtsy',
                path: '../images/emoji/idwtsy.png'
            },
            {
                code: '/kiss',
                path: '../images/emoji/kiss.png'
            },
            {
                code: '/qq88',
                path: '../images/emoji/qq88.png'
            },
            {
                code: '/sad',
                path: '../images/emoji/sad.png'
            },
            {
                code: '/sexy',
                path: '../images/emoji/sexy.png'
            },
            {
                code: '/smile',
                path: '../images/emoji/smile.png'
            },
            {
                code: '/ssmile',
                path: '../images/emoji/ssmile.png'
            },
            {
                code: '/wcis',
                path: '../images/emoji/wcis.png'
            }
        ],
        formatMsgDisp: function(msg){
            msg = msg.replace(/\n/g, '<br />');
            for(var i in this.emojis){
                var reg = new RegExp('\\' + this.emojis[i].code, 'g');
                msg = msg.replace(reg, '<img src="' + this.emojis[i].path + '" style="width:26px;height:26px;">');
            }
            return msg;
        },
        formatFileMsg: function(msg){
            var ext = msg.file.split('.'), ext = ext[ext.length - 1];
            return msg = new EJS({url: 'views/tmpls/filemessage.ejs'}).render({
                url: msg.url,
                ficon: _t.filetypeicon[_t.getFileTypeByExt(ext)],
                file: msg.file
            });
        },
        upfiletypes: {
            'image': ['png', 'jpg', 'jpeg', 'bmp', 'gif'],
            'office': ['doc', 'docs', 'xls', 'xlsx', 'ppt', 'pptx'],
            'zipfile': ['rar', 'zip', 'tar', '7z']
        },
        getFileTypeByExt: function(ext){
            for(var k in _t.upfiletypes){
                if(_t.upfiletypes[k].indexOf(ext) != -1){
                    return k;
                }
            }
            return 'unkown';
        },
        filetypeicon: {
            'image': '../images/image.png',
            'office': '../images/office.jpeg',
            'zipfile': '../images/zip.png',
            'unkown': '../images/file.png'
        },
        constants: {
            productType:{
                '_1': '房抵贷',
                '_2': '车抵贷',
                '_3': '信用贷',
                '_4': '信用卡'
            },
            localInsurance:{
                '_0': '否',
                '_1': '是'
            },
            LocalProvidentFund:{
                '_0': '否',
                '_1': '是'
            },
            isNeedRoom: {
                '_0': '否',
                '_1': '商品住宅',
                '_2': '商铺',
                '_3': '经济适用房/限价房',
                '_4': '房改房/危房',
                '_5': '小产权',
                '_6': '商住两用',
                '_7': '军用房/央产房'
            },
            creditRequire: {
                '_0': '否',
                '_1': '无信用卡或贷款',
                '_2': '信用良好',
                '_3': '有少数逾期',
                '_4': '长期多次逾期'
            },
            isNeedCar: {
                '_0': '无车',
                '_1': '有车',
                '_2': '有车但已被抵押'
            },
            needService: {
                '_0': '否',
                '_1': '是'
            },
            designatedAdvisor: {
                '_0': '否',
                '_1': '是'
            },
            supportHouse: {
                '_0': '否',
                '_1': '是'
            },
            isAudit: {
                '_0': '否',
                '_1': '是'
            },
            isRecommend: {
                '_0': '否',
                '_1': '是'
            },
            Int: {
                '_1': '未发布',
                '_2': '已发布',
                '_3': '已取消'
            }
        },
        productDispValue: {
            //productId: '产品ID',
            productType: '产品类型', //1、房抵贷；2、车抵贷；3、信用贷；4、信用卡'
            productWeight: '产品权值',
            productNumber: '产品编号',
            productName: '产品名称',
            loanLimit: '额度',
            loanPeriod: '贷款期限	',
            monthRate: '月利率',
            rate: '费率',
            repayMethod: '还款方式',
            institution: '所属机构',
            cardLevel: '卡片等级',
            yearFee: '年费政策',
            currentFee: '取现手续费',
            stageRate: '分期费率',
            localInsurance: '本地保险	',
            LocalProvidentFund: '本地公积金',
            publishTime: '发布时间',
            endTime: '结束时间',
            isNeedRoom: '是否需要房',
            creditRequire: '信用要求',
            isNeedCar: '是否需要车',
            telephone: '联系电话',
            needService: '需要信贷顾问提供服务',
            designatedAdvisor: '指定信贷顾问',
            supportHouse: '支持房屋二抵',
            productCharacteristic: '产品特点',
            applicationCondition:'申请条件',
            requiredMaterials: '所需材料',
            costOf: '所含费用',
            repayDescript: '还款说明',
            returnFee: '返费情况',
            remark: '备注',
            Int: '状态',
            productIgUrl: '图片地址',
            isAudit: '是否审核',
            auditReason: '审核原因',
            isRecommend: '是否推荐'
        }
    }
});