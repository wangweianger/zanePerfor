/* eslint-disable */

function Page(json) {
	this.nowPage = parseInt(json.nowPage); //当前页
	this.parent = json.parent; //分页内容所放的div元素
	this.call = json.callback;
	this.totalCount = json.totalCount;
	this.pageSize = json.pageSize;
	this.totalPage = Math.ceil(this.totalCount / this.pageSize); //总页数 
	this.html = "";
	this.setting = json.setting || {
		defaultPage: 5, //默认展示的页数
		firstPageText: "首页", //第一页的字 （可以是：Home）
		prevPageText: "上一页", //上一页的字 
		nextPageText: "下一页", //下一页的字
		lastPageText: "尾页" //尾页的字
	};
	this.centPage = Math.ceil(this.setting.defaultPage / 2); //中间页
	this.init(); //初始化
}
//初始化函数
Page.prototype.init = function () {
	this.parent.html(""); //清空
	this.firstPage(); //首页
	this.prevPageText(); //上一页
	this.everyPage(); //分页
	this.nextPage(); //下一页
	this.lastPage(); //尾页
	this.totalPageText(); //页数显示信息
	this.parent.append(this.html);
	this.callback();
}

//循环页数
Page.prototype.everyPage = function () {
	if (this.totalPage <= this.setting.defaultPage) {
		for (var i = 1; i <= this.totalPage; i++) {
			if (this.nowPage == i) {
				this.html += "<a href='#" + i + "' class='nowPage'>" + i + "</a>";
			} else {
				this.html += "<a href='#" + i + "'>" + i + "</a>";
			}
		}
	} else {
		for (var i = 1; i <= this.setting.defaultPage; i++) {
			var page1 = this.nowPage - this.centPage + i;
			var page2 = this.totalPage - this.setting.defaultPage + i;

			if (this.nowPage < this.centPage) {
				if (this.nowPage == i) {
					this.html += "<a href='#" + i + "' class='nowPage'>" + i + "</a>";
				} else {
					this.html += "<a href='#" + i + "'>" + i + "</a>";
				}
			} else if (this.nowPage > this.totalPage - this.centPage) {
				if (this.setting.defaultPage - (this.totalPage - this.nowPage) == i) {
					this.html += "<a href='#" + this.nowPage + "' class='nowPage'>" + this.nowPage + "</a>";
				} else {
					this.html += "<a href='#" + page2 + "'>" + page2 + "</a>";
				}
			} else {
				if (this.centPage == i) {
					this.html += "<a href='#" + page1 + "' class='nowPage'>" + page1 + "</a>";
				} else {
					this.html += "<a href='#" + page1 + "'>" + page1 + "</a>";
				}
			}
		}
	}
}

//首页
Page.prototype.firstPage = function () {
	if (this.nowPage > this.centPage && this.totalPage >= this.setting.defaultPage + 1) {
		this.html += "<a href='#1'>" + this.setting.firstPageText + "</a>";
	}
}
//上一页
Page.prototype.prevPageText = function () {
	if (this.nowPage >= 2) {
		this.html += "<a href='#" + (this.nowPage - 1) + "'>" + this.setting.prevPageText + "</a>";
	}
}

//下一页
Page.prototype.nextPage = function () {
	if (this.totalPage - this.nowPage >= 1) {
		this.html += "<a href='#" + (this.nowPage + 1) + "'>" + this.setting.nextPageText + "</a>";
	}
}

//尾页
Page.prototype.lastPage = function () {
	if (this.totalPage - this.nowPage >= this.centPage && this.totalPage > this.setting.defaultPage) {
		this.html += "<a href='#" + this.totalPage + "'>" + this.setting.lastPageText + "</a>";
	}
}

//总共页数
Page.prototype.totalPageText = function () {
	this.html += "<span class='page-msg'>共<span>" + this.totalCount + "</span>条记录  每页<span>" + this.pageSize + "</span>条  第<span>" + this.nowPage + "</span>页/共<span>" + this.totalPage + "</span>页</span>";
}

//点击分页执行的函数
Page.prototype.callback = function () {
	var This = this;

	//给每个a绑定事件
	this.parent.find("a").bind("click", function () {
		window.scrollTo(0, 0)
		// Layer.loading({width:300,height:110,srcType:3,title:"正在加载中，请稍后..."});
		This.parent.html(""); //清空
		var nowPage = $(this).attr("href").substring(1);
		//写入分页
		new Page({
			parent: This.parent,
			nowPage: nowPage,
			totalPage: This.totalPage,
			pageSize: This.pageSize,
			totalCount: This.totalCount,
			setting: This.setting,
			callback: This.call
		});

		This.call(nowPage, This.totalPage); //传参

		return false;
	});

}