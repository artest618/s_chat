var FI = {
    syncUser: function(uid){
        return {
            name: 'Zhang San',
            uid: parseInt(Math.random()*0xffffff),
            cname: '张三',
            usertype: '1',
            headicon: '../images/icon/mail.png'
        };
    },
    checkSigned: function(uid){
        return true;
    }
}

module.exports=FI;