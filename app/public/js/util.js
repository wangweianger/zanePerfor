/* eslint-disable */

'use strict';

// util 公共对象函数
class utilfn {
    // 初始化对象
    constructor() {
        this.win = window.top;
        this.UA = navigator.userAgent;
        this.isPC = this.UA.indexOf('Windows NT') > -1;
        this.isAndroid = this.UA.indexOf('Android') > -1;
        this.isIos = this.UA.indexOf('Mac OS X') > -1;
        this.isIphone = this.UA.indexOf('iPhone;') > -1;
        this.isIpad = this.UA.indexOf('iPad;') > -1;
        this.isIE7 = this.UA.indexOf('MSIE 7.0;') > -1;
        this.isIE8 = this.UA.indexOf('MSIE 8.0;') > -1;
        this.isIE9 = this.UA.indexOf('MSIE 9.0;') > -1;
        this.isIE10 = this.UA.indexOf('MSIE 10.0;') > -1;
        this.isIE11 = this.UA.indexOf('Trident') > -1;
    };

    /*封装的ajax函数
        *type           	类型  get|post
        *url            	api地址
        *data           	请求的json数据
        *noLoading  		ajax执行时是否显示遮罩
        *nohideloading  	ajax执行完成之后是否隐藏遮罩
        *notimeout			是否有请求超时
        *complete       	ajax完成后执行（失败成功后都会执行）
        *beforeSend        	请求发送前执行
        *success        	成功之后执行
        *error          	失败之后执行
        *goingError     	是否执行自定义error回调
        *timeout        	ajax超时时间
        *isGoingLogin   	是否跳转到登录界面
        */
    ajax(json) {
        let This = this;
        let noError = true;
        let url = null;
        let asyncVal = typeof(json.async) == 'boolean' ? json.async : true;
        This.showLoading();

        //是否有请求超时
        if (!json.notimeout) {
            var timeout = setTimeout(function() {
                This.hideLoading();
                // 请求超时
                noError = false;
                asyncVal && popup.alert({
                    type: 'msg',
                    title: '您的网络太慢了哦,请刷新重试!'
                });
            }, json.timeout || config.ajaxtimeout);
        }
        // 增加时间戳参数
        if (json.url.indexOf('?') != -1) {
            url = json.url + '&_=' + this.time();
        } else {
            url = json.url + '?_=' + this.time();
        };

        return $.ajax({
            type: json.type || "post",
            url: url,
            data: json.data || "",
            dataType: "json",
            async: asyncVal,
            beforeSend: function(xhr) {
                json.beforeSend && json.beforeSend(xhr);
            },
            success: function(data) {
                if (!json.nohideloading) {
                    This.hideLoading();
                };
                clearTimeout(timeout);
                if (typeof(data) == 'string') {
                    This.error(JSON.parse(data), json);
                } else {
                    This.error(data, json);
                }
            },
            complete: function(XMLHttpRequest) {
                if (!json.nohideloading) {
                    This.hideLoading();
                };
                clearTimeout(timeout);
                if (json.complete) {
                    json.complete(XMLHttpRequest);
                }
            },
            error: function(XMLHttpRequest) {
                This.hideLoading();
                clearTimeout(timeout);
                if (noError) {
                    This._error(XMLHttpRequest, json);
                };
            }
        });
    };


    //file 文件上传
    fileAJAX(json) {
        var This = this;
        var noError = true;
        This.showLoading();
        $.ajax({
            type: json.type || "post",
            url: json.url,
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            data: json.data || "",
            datatype: "json",
            cache: false,
            contentType: false,
            processData: false,
            goingError: json.goingError || false,
            notimeout: json.notimeout || false,
            beforeSend: function(xhr) {
                json.beforeSend && json.beforeSend(xhr);
            },
            xhr: function() {
                var xhr = jQuery.ajaxSettings.xhr();
                xhr.upload.onprogress = function(ev) {
                    if (ev.lengthComputable) {
                        var percent = 100 * ev.loaded / ev.total;
                        json.xhr && json.xhr(percent)
                    }
                }
                return xhr;
            },
            success: function(data) {
                if (!json.nohideloading) {
                    This.hideLoading();
                };
                clearTimeout(time);
                This.error(data, json);
            },
            error: function(XMLHttpRequest) {
                if (!json.nohideloading) {
                    This.hideLoading();
                };
                // json.error(XMLHttpRequest,json);
                clearTimeout(time);
                if (noError) {
                    This._error(XMLHttpRequest, json);
                };
            },
            complete: function(XMLHttpRequest) {
                if (!json.nohideloading) {
                    This.hideLoading();
                };
                clearTimeout(time);
                if (json.complete) {
                    json.complete(XMLHttpRequest);
                }
            },
        });
        //是否有请求超时
        if (!json.notimeout) {
            var time = setTimeout(function() {
                This.hideLoading();
                // 请求超时
                noError = false;
                popup.alert({
                    type: 'msg',
                    title: '您的网络太慢了哦,请刷新重试!'
                });
            }, json.timeout || config.ajaxtimeout);
        }
    }

    /*FormData 上传文件函数
    filename : string  input name 属性
    onlyOne : boolean   是否只上传一个文件
    data : Object      ajax上次的data数据
    url ：string      api地址
    checktype: array     默认['png','jpg'，'gif']
    nohideloading : boolean  	ajax执行完成之后是否隐藏遮罩
    timeout : number        	ajax超时时间
    goingError : boolean     	是否执行自定义error回调
    isGoingLogin : boolean   	是否跳转到登录界面
    success : function   成功之后的回调函数
    complete : function       	ajax完成后执行（失败成功后都会执行）
    error : function          	失败之后执行
    */
    cerateFileFormData(json) {
        var This = this;
        var checktype = json.checktype || ['jpg', 'jpeg', 'png', 'gif'];
        var filename = json.filename ? json.filename : 'file'
        var html = '<div id="createFileHtml" class="hidden">';
        html += '<form enctype="multipart/form-data" id="uploadForm">';
        html += '<input type="file" name="' + filename + '" id="expInputFile" ';
        if (!json.onlyOne) {
            html += ' multiple="multiple"'
        }
        html += '></div></form>';
        if ($('#createFileHtml').length) {
            $('#createFileHtml').remove();
        }
        $('body').append(html);
        $('#expInputFile').click();
        $('#expInputFile').one('change', function() {
            // 检查文件类型
            var files = $('#expInputFile')[0].files;
            for (var i = 0; i < files.length; i++) {
                var begin = false;
                for (var k = 0; k < checktype.length; k++) {
                    var checked = new RegExp("\." + checktype[k] + "$").test(files[i]['name'].toLowerCase());
                    if (!checked) {
                        continue;
                    }
                    begin = checked;
                }
                if (!begin) {
                    popup.alert({
                        title: '请上传正确的文件类型！'
                    });
                    return false;
                };
            }
            // 执行ajax
            This.showLoading();

            //添加验证
            let jsSign = {
                getSign: JSON.stringify(This.getSignData())
            };
            json.data = Object.assign({}, json.data, jsSign);

            var formData = new FormData($("#uploadForm")[0]);
            if (json.data) {
                for (var i in json.data) {
                    formData.append(i, json.data[i]);
                };
            };
            This.fileAJAX({
                url: json.url,
                data: formData,
                notimeout: json.notimeout || false,
                goingError: json.goingError || false,
                beforeSend: function(xhr) {
                    json.beforeSend && json.beforeSend(xhr);
                },
                success: function(data) {
                    $('#createFileHtml').remove();
                    json.success && json.success(data);
                },
                error: function(data) {
                    $('#createFileHtml').remove();
                    json.error && json.error(data, json);
                },
                complete: function(data) {
                    json.complete && json.complete(data);
                },
                xhr: function(data) {
                    json.xhr && json.xhr(data)
                }
            });
        });
    }

    //error 处理函数
    error(data, json) {
        //判断code 并处理
        var dataCode = parseInt(data.code);
        if (!json.isGoingLogin && dataCode == 1004) {
            //判断app或者web
            if (window.location.href.indexOf(config.loginUrl) == -1) {
                sessionStorage.setItem("weixin-url", window.location.href); //记录没有登陆前的访问页面
                location.href = config.loginUrl + '?redirecturl=' + encodeURIComponent(location.href);
            } else {
                popup.alert({
                    type: 'msg',
                    title: '用户未登陆,请登录!'
                });
            }
        } else {
            switch (dataCode) {
                case 1000:
                    json.success && json.success(data);
                    break;
                default:
                    if (json.goingError) {
                        //走error回调
                        json.error && json.error(data);
                    } else {
                        //直接弹出错误信息
                        popup.alert({
                            type: 'msg',
                            title: data.desc
                        });
                    };
            }
        };
    }

    // _error 处理函数
    _error(XMLHttpRequest, json) {
        this.hideLoading();
        if (json.code) {
            json.error(JSON.parse(XMLHttpRequest.responseText));
        } else {
            switch (XMLHttpRequest.status) {
                case 401:
                    if (window.location.href.indexOf(config.loginUrl) == -1) {
                        sessionStorage.setItem("weixin-url", window.location.href); //记录没有登陆前的访问页面
                        window.location.href = config.loginUrl;
                    } else {
                        popup.alert({
                            type: 'msg',
                            title: "你需要登录哦"
                        });
                    };
                    break;
                case 400:
                    popup.alert({
                        type: 'msg',
                        title: "您的请求不合法呢"
                    });
                    break;
                case 404:
                    popup.alert({
                        type: 'msg',
                        title: "访问的地址可能不存在哦"
                    });
                    break;
                case 500:
                case 502:
                    popup.alert({
                        type: 'msg',
                        title: "服务器内部错误"
                    });
                    break;
                    // default:
                    // 	popup.alert({type:'msg',title:"未知错误。程序员欧巴正在赶来修改哦"});
            }
        }
    }

    // 获取当前时间毫秒
    time() {
        return new Date().getTime();
    }

    /*根据参数生成常用的正则表达式
        *string    type 生成的正则表达式类型
        *array     numArr 生成正则的条件数组 例如:[6,16] 也可省略
        */
    regCombination(type, numArr) {
        var reg = "";
        switch (type) {
            case "*": //"*":"不能为空！"
                if (numArr) {
                    reg = new RegExp("^[\\w\\W]{" + numArr[0] + "," + numArr[1] + "}$");
                } else {
                    reg = new RegExp("^[\\w\\W]+$");
                }
                break;
            case "n": //"number":"请填写数字！
                if (numArr) {
                    reg = new RegExp("^\\d{" + numArr[0] + "," + numArr[1] + "}$");
                } else {
                    reg = new RegExp("^\\d+$");
                }
                break;
            case "s": //"s":"不能输入特殊字符！"
                if (numArr) {
                    reg = new RegExp("^[\\u4E00-\\u9FA5\\uf900-\\ufa2d\\w\\.\\s]{" + numArr[0] + "," + numArr[1] + "}$");
                } else {
                    reg = new RegExp("^[\\u4E00-\\u9FA5\\uf900-\\ufa2d\\w\\.\\s]+$");
                }
                break;
            case "c": //"z":"中文验证"
                reg = new RegExp("^[\\u4E00-\\u9FA5\\uf900-\\ufa2d]{" + numArr[0] + "," + numArr[1] + "}$");
                break;
            case "p": //"p":"邮政编码！
                reg = new RegExp("^[0-9]{6}$");
                break;
            case "m": //"m":"写手机号码！"
                reg = new RegExp("^13[0-9]{9}$|14[0-9]{9}$|15[0-9]{9}$|17[0-9]{9}$|18[0-9]{9}$");
                break;
            case "e": //"e":"邮箱地址格式
                reg = new RegExp("^\\w+([-+.']\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$");
                break;
            case "id": //"id":验证身份证
                reg = new RegExp("^\\d{17}[\\dXx]|\\d{14}[\\dXx]$");
                break;
            case "money": //钱
                reg = new RegExp("^[\\d\\.]+$");
                break;
            case "url": //"url":"网址"
                reg = new RegExp("^(\\w+:\\/\\/)?\\w+(\\.\\w+)+.*$");
                break;
            case "u": //
                reg = new RegExp("^[A-Z\\d]+$");
                break;
            case "numLimitTo2": //保留2位小数点正整数
                reg = new RegExp("^-{0,0}\\d+(.\\d{0,2})?$");
                break;
            case "spec": //校验特殊字符
                reg = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？%+_]");
                break;
        }
        return reg;
    }

	/*extent json函数
	 *json1  原始数据
	 *json2  新数据
	 */
	extend(json1, json2) {
		var newJson = json1;
		for (var j in json2) {
			newJson[j] = json2[j];
		}
		return newJson;
	}

	//showLoading
	showLoading() {
		$('#loading').stop().show();
	}

	//hideLoading
	hideLoading() {
		$('#loading').stop().hide();
	}
	
	/*获取url hash*/
	getQueryString(name, hash) {
		var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
		if (hash) {
			if (!window.location.hash) {
				return '';
			};
			var r = decodeURIComponent(window.location.hash).substr(1).match(reg);
		} else {
			var r = decodeURIComponent(window.location.search).substr(1).match(reg);
		}
		if (r != null) {
			return r[2];
		}
		return null;
	}

	/*获取 storage 缓存数据
	 * type  类型   local：localStorage   session：sessionStorage
	 * name  缓存数据name名
	 */
	getStorage(type, name) {
		var type = type || 'local';
		if (type == 'local') {
			var result = localStorage.getItem(name) ? localStorage.getItem(name) : "";
		} else if (type == 'session') {
			var result = sessionStorage.getItem(name) ? sessionStorage.getItem(name) : "";
		}
		return result;
	}

	/*设置 storage 缓存数据
	 *type  类型   local：localStorage   session：sessionStorage
	 *name  缓存数据name名
	 *content  缓存的数据内容
	 */
	setStorage(type, name, content) {
		var type = type || 'local';
		var data = content;
		if (typeof(data) == 'object') {
			data = JSON.stringify(content)
		};
		if (type == 'local') {
			localStorage.setItem(name, data);
		} else if (type == 'session') {
			sessionStorage.setItem(name, data);
		}
	}

	/*vue获得checkbox的值*/
	getCheckBoxVal(arr){
		let result=""
		if(!arr.length) return result;
		arr.forEach((item)=>{
			if(item.checked){
				result+=item.value+','
			}
		})
		return result.slice(0,-1);
	}

	/*vue转换checkbox的值*/
	setCheckBoxVal(arr,str){
		let copyarr = arr;
		if(!str) return copyarr;
		let newArr=str.split(',')
		copyarr.forEach((itemp)=>{
			newArr.forEach((item)=>{
				if(itemp.value == item){
					itemp.checked=true;
				}
			})
		})
		return copyarr;
	}

	goBack(){
		window.history.go(-1);
	}
}

//初始化util对象
window.util = new utilfn();



