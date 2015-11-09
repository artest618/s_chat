/**
 * Created by tony on 15-9-10.
 */
define('mini_msg', [], function(){
   return (function(self){
           var _no_timer, _ok_timer;//倒计时
           function _show_msg(params) {
               var str = '', msg = "", title = "", btns = [], height , width , time = 1500,
                   now_t = new Date().getTime(),is_close_call,
                   _error_msg = "请输入message或参数！",effect="",options,
                   selectedEffect={
                       "blind":"blind","bounce":"bounce","clip":"clip","drop":"drop",
                       "explode":"explode","fold":"fold" ,"highlight":"highlight","puff":"puff",
                       "pulsate":"pulsate","scale":"scale","shake":"shake","size":"size","slide":"slide"
                   };

               //判断传入参数是否为对象 获取效果参数
               if(typeof(arguments[0]) == "object"){
                   effect = arguments[0];
               }else{
                   effect = arguments[2];
               }
               //如果为scale 或 size 则单独设置options
               if ( effect === "scale" ) {
                   options = { percent: 100 };
               } else if ( effect === "size" ) {
                   options = { to: { width: 280, height: 185 } };
               }

               //判断如果传入参数大于0则
               if (arguments.length > 0) {
                   if (typeof(arguments[0]) == "object") {
                       if (arguments[0].msg) {
                           msg = arguments[0].msg;
                           if (arguments[0].title) {
                               title = arguments[0].title;
                           }
                           if (arguments[0].btns) {
                               btns = arguments[0].btns;
                           }
                           if(arguments[0].width){
                               width=arguments[0].width;
                           }
                           if(arguments[0].height){
                               height=arguments[0].height;
                           }

                           str = getStr(msg, title, btns, now_t,width,height);

                           $(document.body).append(str);
                           if (btns&&btns.length>0) {
                               $(".msg_btn_ok",".cm_msg_dialog_"+now_t).on("click",function(){
                                   btns[0]&&btns[0].callback(now_t);
                               });
                               $(".msg_btn_cancel",".cm_msg_dialog_"+now_t).on("click",function(){
                                   btns[1]&&btns[1].callback(now_t);
                               });

                           }


                           showAutoBg(".cm_msg_dialog_" + now_t);

                           if (arguments[0].draggable) {
                               $(".cm_msg_dialog_" + now_t).find(".edu_msg_title").css("cursor", "move");
                               $(".cm_msg_dialog_" + now_t).draggable({ handle: ".edu_msg_title", cursor: "move" });
                           }
                           if (arguments[0].resizable) {
                               $(".cm_msg_dialog_" + now_t).resizable({ animate: true });
                           }
                           is_close_call=arguments[0].callback?arguments[0].callback:"";

                           //绑定关闭
                           binding_alls(now_t,is_close_call);

                           //定时关闭
                           if ((typeof(arguments[0].time) == "number")) {
                               _ok_timer = setTimeout(function () {
                                   msg_close(now_t,is_close_call);
                               }, arguments[0].time);
                           }
                       } else {
                           typeof(console) ? console.error(_error_msg) : "";
                       }

                   } else {
                       //TODO
                       msg = arguments[0];
                       str = getStr(msg, now_t);

                       $(document.body).append(str);

                       is_close_call=arguments[3]?arguments[3]:"";

                       binding_alls(now_t,is_close_call);


                       $(".cm_msg_dialog_" + now_t).find(".edu_msg_title").css("cursor", "");
                       showAutoBg(".cm_msg_dialog_" + now_t);

                       //定时关闭
                       if ((typeof(arguments[1]) == "number")) {
                           _no_timer = setTimeout(function () {
                               msg_close(now_t,is_close_call);
                           }, arguments[1]);
                       }
                   }


               } else {
                   typeof(console) ? console.error(_error_msg) : "";
               }

           };

           function binding_alls(now_t,callback){
               //绑定关闭弹窗
               $(".close",".cm_msg_dialog_" + now_t).click(function () {
                   msg_close(now_t);
                   self.clearTimeout(_no_timer);
                   callback&&callback();
               });
               $(".cm_msg_dialog_" + now_t).click(function () {
                   msg_close(now_t);
                   self.clearTimeout(_no_timer);
                   callback&&callback();
               });
           }
           //msg,title,btns,now_t
           function getStr() {
               var str = '', self_str = '', self_msg = "", self_title = "", self_btns = [], now_t,width,height;
               if (arguments.length > 2) {
                   self_title = arguments[1];
                   self_msg = arguments[0];
                   self_btns = arguments[2];
                   now_t = arguments[3];
                   width = arguments[4]?arguments[4]:"";
                   height = arguments[5]?arguments[5]:"";
               } else {
                   self_msg = arguments[0];
                   now_t = arguments[1];
               }
               str += ' <div class="m_dialog cm_msg_dialog_' + now_t + '" style="display: none;width:'+width+';height:'+height+';">';
               if(self_title){
                   str += '       <p class="title">'+self_title+'</p>';
               }
               str += '   <p class="content '+(self_title&&self_btns.length==0?"nobtns":"")+'  '+(self_title?"":"notitle")+' '+(!self_title&&self_btns.length==0?"full":"")+'">'+ self_msg + '</p>';
               if(self_btns.length!=0){
                   str += '   <div class="m_btns">';
                   if(self_btns[0]){
                       str += '        <a class="msg_btn_ok t-btn cancel" style='+(self_btns.length==1?"width:20.75rem;":"")+'>'+(self_btns[0].text||"取消")+'</a>';
                   }
                   if(self_btns[1]){
                       str += '        <a class="msg_btn_cancel t-btn ok">'+(self_btns[1].text||"关闭")+'</a>';
                   }
                   str += '   </div>';
               }else{

               }
               str += ' </div>';
               str += ' <div class="t-dimer dimer_' + now_t + '"></div>';
               return str;
           }
           //关闭message
           function msg_close(now_t,callback){
               hideAutoBg(".cm_msg_dialog_" + now_t);
               $(".cm_msg_dialog_" + now_t).remove();
               $(".dimer_" + now_t).remove();
               callback&&callback();
           }
           function hideAutoBg(selector){
               $(".t-dimer").addClass("active");
               $(selector).hide();
           }
           function showAutoBg(selector){
               var h, w,left,top;
               $(".t-dimer").addClass("active");
               h=$(".m_dialog").css("height").split("px")[0];
               w=$(".m_dialog").css("width").split("px")[0];
               h=parseInt(h);w=parseInt(w);
               left=typeof h=="number"?h/2:0;
               top=typeof h=="number"?h/2:0;

               $(selector).show().css({'margin-left':'-'+left,'margin-to':'-'+top});
           }
           self._show_msg = _show_msg;
           self._hide_msg = msg_close;
   })(window);
});