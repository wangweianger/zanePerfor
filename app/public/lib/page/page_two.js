import common from 'common/js/util'
import popup from 'popup'

function Page (json){
    this.route=json.route;
    this.routerName=json.routerName;
    this.nowPage=parseInt(json.nowPage);   //当前页
    this.parent=json.parent;  //分页内容所放的div元素
    this.call=json.callback;
    this.totalCount=json.totalCount;
    this.pageSize=json.pageSize;
    this.totalPage=Math.ceil(this.totalCount/this.pageSize); //总页数 
    this.html="";
    this.type=json.type || 1;
    this.setting=json.setting || {
        defaultPage:5,         //默认展示的页数
        firstPageText:"首页",  //第一页的字 （可以是：Home）
        prevPageText:"上一页", //上一页的字 
        nextPageText:"下一页", //下一页的字
        lastPageText:"最后一页"    //尾页的字
    };
    this.centPage=Math.ceil(this.setting.defaultPage/2);  //中间页
    this.init(); //初始化
}
//初始化函数
Page.prototype.init=function(){
    this.parent.html(""); //清空
    this.totalPageText(); //页数显示信息
    this.firstPage();  //首页
    this.prevPageText(); //上一页
    this.everyPage();  //分页
    this.nextPage();   //下一页
    this.lastPage();   //尾页
    this.pageSearch(); //搜索页
    this.parent.append(this.html);
    this.callback();
}

//循环页数
Page.prototype.everyPage=function(){
    if(this.totalPage<=this.setting.defaultPage){
        for(var i=1;i<=this.totalPage;i++){
            if(this.nowPage==i){
                this.html+="<a href='#"+i+"' class='nowPage'>"+i+"</a>";
            }else{
                this.html+="<a href='#"+i+"'>"+i+"</a>";
            }   
        }   
    }else{
        for(var i=1;i<=this.setting.defaultPage;i++){
            var page1 = this.nowPage-this.centPage+i; 
            var page2 = this.totalPage-this.setting.defaultPage+i;
            
            if(this.nowPage<this.centPage){
                if(this.nowPage==i){
                    this.html+="<a href='#"+i+"' class='nowPage'>"+i+"</a>";
                }else{
                    this.html+="<a href='#"+i+"'>"+i+"</a>";
                }   
            }else if(this.nowPage>this.totalPage-this.centPage){
                if(this.setting.defaultPage-(this.totalPage-this.nowPage)==i){
                    this.html+="<a href='#"+this.nowPage+"' class='nowPage'>"+this.nowPage+"</a>";
                }else{
                    this.html+="<a href='#"+page2+"'>"+page2+"</a>";
                }
            }else {
                if(this.centPage==i){
                    this.html+="<a href='#"+page1+"' class='nowPage'>"+page1+"</a>";
                }else{
                    this.html+="<a href='#"+page1+"'>"+page1+"</a>";
                }   
            }   
        }
    }
}

//首页
Page.prototype.firstPage=function(){
    if(this.nowPage>this.centPage && this.totalPage>=this.setting.defaultPage+1){
        this.html+="<a href='#1'>"+this.setting.firstPageText+"</a>";
    }
}
//上一页
Page.prototype.prevPageText=function(){
    if(this.nowPage>=2){
        this.html+="<a href='#"+(this.nowPage-1)+"'>"+this.setting.prevPageText+"</a>";
    }
}

//下一页
Page.prototype.nextPage=function(){
    if(this.totalPage - this.nowPage >= 1){
        this.html+="<a href='#"+(this.nowPage+1)+"'>"+this.setting.nextPageText+"</a>";
    }
}

//尾页
Page.prototype.lastPage=function(){
    if(this.totalPage-this.nowPage>=this.centPage && this.totalPage > this.setting.defaultPage){
        this.html+="<a href='#"+this.totalPage+"'>"+this.setting.lastPageText+"</a>";
    }
}

//总共页数
Page.prototype.totalPageText=function(){
    this.html+="<span class='page-msg'>共 <span>"+this.totalCount+"</span> 条记录  共<span>"+this.totalPage+"</span>页</span>&nbsp;&nbsp;&nbsp;&nbsp;";
}

//搜索页数
Page.prototype.pageSearch=function(){
    if(this.totalPage>this.setting.defaultPage){
        this.html+="<span class='Page-search-span'>跳转到<input type='text' _onkeypress='return common.IsNum(event)' id='Page-search'>页</span><button id='pageSearch'>确定</button>" 
    }
}

//点击分页执行的函数
Page.prototype.callback=function(){
    var This=this,id=$(this.parent).attr("id");
    if(this.type==1){
        //按hash值改变分页
        this.parent.find("a").bind("click",function(){
            var nowPage=$(this).attr("href").substring(1);
            //请求路由
            var json=JSON.parse(JSON.stringify(This.route.query))
            var query=Object.assign(json,{
                page:nowPage,
                resTime:new Date().getTime()
            })
            //youwei add 防止切换页码浏览器不刷新视图
            query.refresh = new Date().getTime()
            //lism 一个页面多个翻页
            var pageVal={id:id,page:nowPage};
            common.setStorage('session','pageKey',pageVal);

            query.page = nowPage
            router.push({
                name: This.routerName,
                query: query
            })
            This.getPage(nowPage);
            return false;
        }); 
        //输入搜索查询
        $(document).keydown(function (event) { if(event.keyCode==13){searchpage();} });
        this.parent.find("#pageSearch").click(function(){
            searchpage();
        });
        function searchpage(){
            var nowPage=This.parent.find('#Page-search').val();
            if(parseInt(nowPage)>This.totalPage){
                This.parent.find('#Page-search').val('');
                popup.miss({title:"超出搜索页数！"}); return false;
            }
            if(parseInt(nowPage)>0){
                //请求路由
                var query = This.route.query || {}
                query.refresh = new Date().getTime()

                //lism 一个页面多个翻页
                var pageVal={id:id,page:nowPage};
                common.setStorage('session','pageKey',pageVal);

                query.page = nowPage
                //请求路由
                router.push({
                    name: This.routerName,
                    query: {
                        page: nowPage
                    }
                })
                This.getPage(nowPage);
            } 
            
        };
    }else if(this.type==2){
        //给每个a绑定事件
        this.parent.find("a").bind("click",function(){
            var nowPage=$(this).attr("href").substring(1);
            This.getPage(nowPage);
            return false;
        }); 
        //输入搜索查询
        this.parent.find("#pageSearch").click(function(){
            var nowPage=This.parent.find('#Page-search').val();
            if(parseInt(nowPage)>This.totalPage){
                popup.miss({title:"超出搜索页数！"}); return false;
            }else{
                if(parseInt(nowPage)>0){
                    This.getPage(nowPage);
                } 
            }
            
        });
    }
    
    
}

/*请求分页函数*/
Page.prototype.getPage=function(nowPage){
    // common.showLoading();
    this.parent.html(""); //清空
    //写入分页
    new Page({
            route:this.route,
            routerName:this.routerName,
            parent:this.parent,
            nowPage:nowPage,
            type:this.type,
            totalPage:this.totalPage,
            pageSize:this.pageSize,
            totalCount:this.totalCount,
            setting: this.setting,
            callback:this.call
    }); 
    if(this.call){
        this.call(nowPage,this.totalPage);   //传参
    }
}


module.exports=function(json){
    new Page(json)
}
