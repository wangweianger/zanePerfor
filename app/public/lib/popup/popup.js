/* eslint-disable */

//构造函数
function PopLayer(){
    this.setting={};
}
/*extent json函数*/
PopLayer.prototype.extend=function(json1,json2){
    var newJson=json1;
    for(var i in json1){
        for( var j in json2){
            newJson[j]=json2[j];
        }
    }
    return newJson;
}
/*公共变量*/
PopLayer.prototype.varLiang=function(json){
    this.setting={
        time:2000,
        header:"信息",     //头部信息
        haveHeader:true,  //是否显示头部
        maskHide:true,   //是否点击遮罩隐藏
        closeBut:false,    //是否需要关闭按钮
        loadingImg:'loading-1',
        type:"msg",  
        style:'',
        title:"请填写提示信息！",
        yesHtml:'',
        imgs:{
           msg:'icon-1',
           error:'icon-2', 
           success:'icon-3', 
        },
        yes:function(){},
        callback:function(){},
    };
	if(json){
        this.setting=this.extend(this.setting,json); //继承
    }
}
/*页面层*/
PopLayer.prototype.customHtml=function(json){
	this.varLiang(json);
    var str='<div class="popup">';
	str+=this.setting.maskHide?'<div class="mask" onclick="closeThisPopup(this)"></div>':'<div class="mask"></div>';
    str+='<div class="popup_main" style="'+this.setting.style+'"><div class="maminContent">';
    if(this.setting.haveHeader){
    	str+=this.setting.closeBut?'<div class="header_poup">'+this.setting.header+'</div>':'<div class="header_poup">'+this.setting.header+'<span onclick="closeThisPopup(this)"></span></div>';
    }
    str+='<div class="content html">'+this.setting.html+'</div>';
    str+='</div></div></div>';
	         
    addendHtml(str);
    middle(); //居中
    this.setting.callback();
	
}
/*iframe层*/
PopLayer.prototype.iframe=function(json){
    win.showLoading();
	this.varLiang(json);
    var str='<div class="popup popup-iframe">';
	str+=this.setting.maskHide?'<div class="mask" onclick="closeThisPopup(this)"></div>':'<div class="mask"></div>';
    str+='<div class="popup_main" style="'+this.setting.style+'"><div class="maminContent">';
    if(this.setting.haveHeader){
    	str+=this.setting.closeBut?'<div class="header_poup">'+this.setting.header+'</div>':'<div class="header_poup">'+this.setting.header+'<span onclick="closeThisPopup(this)"></span></div>';
    }
    var isIos=navigator.userAgent.indexOf('Mac OS X')>-1;
    var isIpad=navigator.userAgent.indexOf('iPad;')>-1;
    if(isIos || isIpad){
       str+='<div class="content html contentios">'; 
    }else{
       str+='<div class="content html">'; 
    };
    str+='<iframe id="iframePage" src="'+json.src+'" width="100%" height="100%" frameborder="0"></iframe></div>';
    if(this.setting.yesHtml){str+='<div class="yesHtml" onclick="closeIframePopup(this)">'+this.setting.yesHtml+'</div>';}
    str+='</div></div></div>';
	         
    addendHtml(str);
    var height=0;
    if(this.setting.yesHtml){
        height=$('div.popup_main').height()-20;
    }else{
        height=$('div.popup_main').height();     
    }
	if(this.setting.haveHeader){
		$('div.content').css({height:(height-80)+'px'});
	}else{
		$('div.content').css({height:(height-50)+'px'});
	};
    var _this=this;
    /*横竖屏切换时执行*/
    $(window).on('resize',function() {
        var heightTwo=0;
        if(_this.setting.yesHtml){
            heightTwo=$('div.popup_main').height()-20;
        }else{
            heightTwo=$('div.popup_main').height();     
        }
        if(_this.setting.haveHeader){
            $('div.content').css({height:(heightTwo-80)+'px'});
        }else{
            $('div.content').css({height:(heightTwo-50)+'px'});
        }
    });
    setTimeout(function(){win.hideLoading();},1000);
    window.closeIframePopup=function(obj){
        $(obj).parents('div.popup').remove();
        if(json.callback){json.callback()}
    }
}

//信息层
PopLayer.prototype.alert=function(json){
    this.varLiang(json);
    var str='<div class="popup">';
	str+=this.setting.maskHide?'<div class="mask" onclick="closeThisPopup(this)"></div>':'<div class="mask"></div>';
    str+='<div class="popup_main" style="'+this.setting.style+'"><div class="maminContent">';
    if(this.setting.haveHeader){
    	str+=this.setting.closeBut?'<div class="header_poup"><i class="'+this.setting.imgs[json.type]+'"></i>\
        '+this.setting.header+'</div>':
        '<div class="header_poup"><i class="'+this.setting.imgs[json.type]+'"></i>'+this.setting.header+'<span onclick="closeThisPopup(this)"></span></div>';
    }
    str+='<div class="content">'+this.setting.title+'</div>';
    str+='<div class="footer"><span class="yes yesok">确定</span></div>';
    str+='</div></div></div>';
	var This=this;
    addendHtml(str);
    $('span.yes').click(function(){
        if(json.yes){
            dosomePopup(this,This.setting.yes);
        }else{
            closeThisPopup(this);
        }
    });
    middle(); //居中
}
//确认层
PopLayer.prototype.confirm=function(json){
	this.varLiang(json);
    var This=this;
    var str='<div class="popup">';
    	str+=this.setting.maskHide?'<div class="mask" onclick="closeThisPopup(this)"></div>':'<div class="mask"></div>';
		str+='<div class="popup_main" style="'+this.setting.style+'"><div class="maminContent">';
        if(this.setting.haveHeader){
        	str+='<div class="header_poup"><i class="'+this.setting.imgs[json.type]+'"></i>'+this.setting.header+'<span onclick="closeThisPopup(this)"></span></div>';
        }
        str+='<div class="content">'+this.setting.title+'</div>';
        str+='<div class="footer"><span class="yes yes5 yesok">确定</span><span class="no">取消</span></div>';
        str+='</div></div></div>';     
    addendHtml(str);
    $('span.yes').click(function(){
        dosomePopup(this,This.setting.yes);
    });
    $('span.no').click(function(){
        dosomePopup(this,This.setting.no);
    });
    middle(); //居中
}
/*2s消失*/
PopLayer.prototype.miss=function(json){
	this.varLiang(json);
    this.setting.haveHeader=true;
    var str='<div class="popup popup-hide" onclick="closeThisPopup(this)">';
		str+='<div class="popup_main" style="'+this.setting.style+'"><div class="maminContent maskMain miss_popup">';
        str+='<div class="content content-no">'+this.setting.title+'</div>';
        str+='</div></div></div>';     
    addendHtml(str);
    middle(); //居中
    return new Promise((res,ret)=>{
        setTimeout(function(){
            $('div.popup-hide').remove();
            res();
        },this.setting.time);
    })
}

//加载层
PopLayer.prototype.loading=function(json){
    this.varLiang(json);
    if(json.title){
        this.setting.title= json.title;
    }else{
        this.setting.title="加载中,请稍后...";  
    };
    var str='<div class="popup popup-loading">';
		str+='<div class="popup_main" style="'+this.setting.style+'"><div class="maminContent maskMain">';
        str+='<div class="content content-no">'+this.setting.title+'</div>';
        str+='</div></div></div>';     
    addendHtml(str);
    middle(); //居中
}
/*关闭加载层*/
PopLayer.prototype.closeLoading=function(){
	$('div.popup-loading').remove();
}
/*关闭iframe层*/
PopLayer.prototype.closeIframe=function(){
	$(".popup-iframe", parent.document).remove();
}
/*确认回调函数*/
window.dosomePopup=function(obj,yes){
	closeThisPopup(obj);
	yes();
}
window.addendHtml=function(str){
    if(!$('div.popup').length){
        $('body').append(str);
    }
}
/*关闭遮罩*/
window.closeThisPopup=function(obj){
	if($(obj).parents('div.popup').length){
        $(obj).parents('div.popup').remove();
    }else{
        $(obj).remove();
    }
}
//居中函数
window.middle=function(){
	var main=$('div.popup_main');
    main.css({marginTop:-main.height()/2-20+"px"}); 
}

window.popup = new PopLayer();





