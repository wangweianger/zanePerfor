/* eslint-disable */
// 时间格式化
if(!new Date().format){
    Date.prototype.format = function (fmt) { //author: meizz 
        var o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "h+": this.getHours(), //小时 
            "H+":this.getHours()>12?this.getHours()-12:this.getHours(),
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
};

let Filter = {
    // 图片地址过滤器
    imgBaseUrl:function(img) {
        if (!img) return '../images/index/bg-0.png';
        if (img.indexOf('http:') !== -1 || img.indexOf('HTTP:') !== -1 || img.indexOf('https:') !== -1 || img.indexOf('HTTPS:') !== -1) {
            return img + '?imageslim';
        } else {
            return config.imgBaseUrl + img + '?imageslim';
        }
    },
    toFixed(val,type=false){
        val = parseFloat(val)
        if(type){
            val = val/1000
            return val>0?val.toFixed(3)+' s':val.toFixed(2);
        }else{
            return val.toFixed(2)+' ms';
        }
    },
    toSize(val){
        val=val*1
        if(val>=1024){
            return (val/1024).toFixed(2)+' KB'
        }else if(val>0){
            return val.toFixed(2)+' B'
        }else{
            return 0
        }
    },
    // 时间过滤器
    date(value, gengefu, full) {
        if (!value) return;
        let ty = gengefu || '-';
        if (full) {
            return new Date(value).format('yyyy' + ty + 'MM' + ty + 'dd hh:mm:ss');
        } else {
            return new Date(value).format('yyyy' + ty + 'MM' + ty + 'dd');
        };
    },
    //limitTo过滤器
    limitTo(value, num) {
        if (!value) return;
        var text = "";
        if (value.length < num) {
            text = value;
        } else {
            text = value.substring(0, num) + '···';
        }
        return text;
    },
    // 应用类型过滤器
    systemType(val) {
        let result = '';
        switch (val) {
            case 'web':
                result = 'WEB浏览器';
                break;
            case 'wx':
                result = '微信小程序';
                break;    
        }
        return result;
    },
    // 流量单位
    flow(val = 0) {
        let result = 0;
        let value = val;
        let index = 0;
        while (value >= 1024) {
            value = value / 1024
            index++;
        }
        value = value.toFixed(2);
        if (index >= 4) {
            value = value + 'T'
        } else if (index >= 3) {
            value = value + 'G'
        } else if (index >= 2) {
            value = value + 'M'
        } else if (index >= 1) {
            value = value + 'KB'
        } else {
            value = value + 'B'
        }
        return value;
    },
}

window.Filter = {};

for(let n in Filter){
    window['Filter'][n] = Filter[n];
}
