'use strict';

const Service = require('egg').Service;

class WebPerformanceScriptService extends Service {
    // 获得上报脚本
    async getPerformanceScript(ctx) {
        const query = ctx.request.query;
        const appId = query.appId;
        const USESDK = query.USESDK || 'FALSE';
        // await this.setSYSTEMredis(appId);
        await this.setUserCookie(ctx);
        return USESDK === 'FALSE' ? await this.reduceScriptText(appId) : '';
    }

    // 设置用户cookie信息
    async setUserCookie(ctx) {
        const markuser = ctx.cookies.get('markuser') || '';

        if (!markuser) {
            // 第一次访问
            const usercookie = this.app.signwx({
                mark: 'markuser',
                timestamp: new Date().getTime(),
                random: this.app.randomString(),
            }).paySign;
            ctx.cookies.set('markuser', usercookie);
        }
        // 每次页面标识
        const pagecookie = this.app.signwx({
            mark: 'markpage',
            timestamp: new Date().getTime(),
            random: this.app.randomString(),
        }).paySign;
        ctx.cookies.set('markpage', pagecookie);

        return {};
    }

    // 生成性能上报脚本
    async reduceScriptText(appId) {
        if (!appId) throw new Error('获得网页上报脚本：系统标识appId不能为空');
        // 获得系统缓存信息
        const system = await this.service.web.webSystem.getSystemForAppId(appId);
        if (!system.app_id) throw new Error('获得网页上报脚本：appId对应的系统缓存无数据');

        if (system.is_use !== 0) return 'window.Performance = () => {}';

        const script = `
        if(typeof require === 'function' && typeof exports === "object" && typeof module === "object") {
            module.exports = Performance
        }else{
            window.Performance = Performance
        }

        window.ERRORLIST = [];
        window.ADDDATA   = {};
        Performance.addError =(err={})=>{
            err = {
                method:'GET',
                msg:err.msg,
                n:'js',
                data:{
                    col:err.col,
                    line:err.line,
                    resourceUrl:err.resourceUrl
                }
            }
            ERRORLIST.push(err)
        }
        Performance.addData = fn =>{ fn&&fn(ADDDATA) }

        // web msgs report function
        function Performance(option,fn){try{  
            let opt = {
                // 上报地址
                domain:'http://localhost/api',
                // 脚本延迟上报时间
                outtime:1000,
                // ajax请求时需要过滤的url信息
                filterUrl:['http://localhost:35729/livereload.js?snipver=1','http://localhost:8000/sockjs-node/info'],
                // 是否上报页面性能数据
                isPage:${system.is_statisi_pages === 0},
                // 是否上报ajax性能数据
                isAjax:${system.is_statisi_ajax === 0},
                // 是否上报页面资源数据
                isResource:${system.is_statisi_resource === 0},
                // 是否上报错误信息
                isError:${system.is_statisi_error === 0},
            }
            opt = Object.assign(opt,option);
            let conf = {
                //资源列表 
                resourceList:[],
                // 页面性能列表
                performance:{},
                // 错误列表
                errorList:[],
                // 页面fetch数量
                fetchNum:0,
                // ajax onload数量
                loadNum:0,
                // 页面ajax数量
                ajaxLength:0,
                // 页面fetch总数量
                fetLength:0,
                // 页面ajax信息
                ajaxMsg:[],
                // ajax成功执行函数
                goingType:'',
                // 是否有ajax
                haveAjax:false,
                // 是否有fetch
                haveFetch:false,
                // 来自域名
                preUrl:document.referrer&&document.referrer!==location.href?document.referrer:'',
                // 浏览器信息
                appVersion:navigator.appVersion,
                // 当前页面
                page:location.href,
            }
            // error default
            let errordefo = {
                t:'',   
                n:'js',
                msg:'',  
                data:{}
            };

            let beginTime   = new Date().getTime()
            let loadTime    = 0
            let ajaxTime    = 0
            let fetchTime   = 0

            // error上报
            if(opt.isError) _error();

            // 绑定onload事件
            addEventListener("load",function(){
                loadTime = new Date().getTime()-beginTime
                getLargeTime();
            },false);

            // 执行fetch重写
            if(opt.isAjax || opt.isError) _fetch();

            //  拦截ajax
            if(opt.isAjax || opt.isError) _Ajax({
                onreadystatechange:function(xhr){
                    if(xhr.readyState === 4){
                        setTimeout(()=>{
                            if(conf.goingType === 'load') return;
                            conf.goingType = 'readychange';

                            getAjaxTime('readychange')

                            if (xhr.status < 200 || xhr.status > 300) {
                                xhr.method = xhr.args.method
                                ajaxResponse(xhr)
                            }
                        },600)
                    }
                },
                onerror:function(xhr){
                    getAjaxTime('error')
                    if(xhr.args){
                        xhr.method = xhr.args.method
                        xhr.responseURL = xhr.args.url
                        xhr.statusText = 'ajax request error'
                    }
                    ajaxResponse(xhr)
                },
                onload:function(xhr){
                    if(xhr.readyState === 4){
                        if(conf.goingType === 'readychange') return;
                        conf.goingType = 'load';
                        getAjaxTime('load');
                        if (xhr.status < 200 || xhr.status > 300) {
                            xhr.method = xhr.args.method
                            ajaxResponse(xhr)
                        }
                    }
                },
                open:function(arg,xhr){
                    if(opt.filterUrl&&opt.filterUrl.length){
                        let begin = false;
                        opt.filterUrl.forEach(item=>{ if(arg[1].indexOf(item)!=-1) begin = true; })
                        if(begin) return;
                    }

                    let result = { url:arg[1], method: arg[0]||'GET' ,type:'xmlhttprequest' }
                    this.args = result

                    clearPerformance()
                    conf.ajaxMsg.push(result)
                    conf.ajaxLength   = conf.ajaxLength+1;
                    conf.haveAjax     = true
                }
            })

            // report date
            function reportData(){
                setTimeout(()=>{
                    if(opt.isPage) perforPage();
                    if(opt.isResource || opt.isAjax) perforResource();
                    if(ERRORLIST&&ERRORLIST.length) conf.errorList = conf.errorList.concat(ERRORLIST)
                    let w = document.documentElement.clientWidth || document.body.clientWidth;
                    let h = document.documentElement.clientHeight || document.body.clientHeight;
                    let result = {
                        time:new Date().getTime(),
                        page:conf.page,
                        preUrl:conf.preUrl,
                        appVersion:conf.appVersion,
                        errorList:conf.errorList,
                        performance:conf.performance,
                        resourceList:conf.resourceList,
                        addData:ADDDATA,
                        screenwidth:w,
                        screenheight:h,
                        appId:'${appId}',
                    }
                    fn&&fn(result)
                    if(!fn && window.fetch){
                        fetch(opt.domain,{ 
                            method: 'POST',
                            credentials: 'include',
                            headers: {'Content-Type': 'application/json'},
                            type:'report-data',
                            body:JSON.stringify(result)
                        })
                    }
                },opt.outtime)
            }

            //比较onload与ajax时间长度
            function getLargeTime (){
                if(conf.haveAjax&&conf.haveFetch&&loadTime&&ajaxTime&&fetchTime){
                    reportData()
                }else if(conf.haveAjax&&!conf.haveFetch&&loadTime&&ajaxTime){
                    reportData()
                }else if(!conf.haveAjax&&conf.haveFetch&&loadTime&&fetchTime){
                    reportData()
                }else if(!conf.haveAjax&&!conf.haveFetch&&loadTime){
                    reportData()
                }
            }

            // 统计页面性能
            function perforPage(){
                if (!window.performance) return;
                let timing = performance.timing
                conf.performance = {
                    // DNS解析时间
                    dnst:timing.domainLookupEnd-timing.domainLookupStart || 0,  
                    //TCP建立时间
                    tcpt:timing.connectEnd-timing.connectStart || 0, 
                    // 白屏时间  
                    wit:timing.responseStart-timing.navigationStart || 0, 
                    //dom渲染完成时间
                    domt:timing.domContentLoadedEventEnd-timing.navigationStart || 0,  
                    //页面onload时间
                    lodt:timing.loadEventEnd - timing.navigationStart || 0, 
                    // 页面准备时间 
                    radt:timing.fetchStart-timing.navigationStart || 0, 
                    // 页面重定向时间
                    rdit:timing.redirectEnd - timing.redirectStart || 0, 
                    // unload时间
                    uodt:timing.unloadEventEnd - timing.unloadEventStart || 0,
                    //request请求耗时
                    reqt:timing.responseEnd - timing.requestStart || 0, 
                    //页面解析dom耗时
                    andt:timing.domComplete - timing.domInteractive || 0, 
                }
            }

            // 统计页面资源性能
            function perforResource(){
                if (!window.performance && !window.performance.getEntries) return false;
                let resource = performance.getEntriesByType('resource')

                let resourceList = [];
                if(!resource && !resource.length) return resourceList;

                resource.forEach((item)=>{
                    if(!opt.isAjax && (item.initiatorType == 'xmlhttprequest' || item.initiatorType == 'fetchrequest')) return;
                    if(!opt.isResource && (item.initiatorType != 'xmlhttprequest' && item.initiatorType !== 'fetchrequest')) return;
                    let json = {
                        name:item.name,
                        method:'GET',
                        type:item.initiatorType,
                        duration:item.duration.toFixed(2)||0,
                        decodedBodySize:item.decodedBodySize||0,
                        nextHopProtocol:item.nextHopProtocol,
                    }
                    if(conf.ajaxMsg && conf.ajaxMsg.length){
                        for(let i=0,len=conf.ajaxMsg.length;i<len;i++){
                            if(conf.ajaxMsg[i].url===item.name){
                                json.method = conf.ajaxMsg[i].method||'GET'
                                json.type   = conf.ajaxMsg[i].type || json.type
                            }
                        }
                    }
                    resourceList.push(json)
                })
                conf.resourceList = resourceList
            }

            // ajax重写
            function _Ajax (funs) {
                window._ahrealxhr = window._ahrealxhr || XMLHttpRequest
                XMLHttpRequest = function () {
                    this.xhr = new window._ahrealxhr;
                    for (let attr in this.xhr) {
                        let type = "";
                        try {
                            type = typeof this.xhr[attr]
                        } catch (e) {}
                        if (type === "function") {
                            this[attr] = hookfun(attr);
                        } else {
                            Object.defineProperty(this, attr, {
                                get: getFactory(attr),
                                set: setFactory(attr)
                            })
                        }
                    }
                }
                function getFactory(attr) {
                    return function () {
                        return this.hasOwnProperty(attr + "_")?this[attr + "_"]:this.xhr[attr];
                    }
                }
                function setFactory(attr) {
                    return function (f) {
                        let xhr = this.xhr;
                        let that = this;
                        if (attr.indexOf("on") != 0) {
                            this[attr + "_"] = f;
                            return;
                        }
                        if (funs[attr]) {
                            xhr[attr] = function () {
                                funs[attr](that) || f.apply(xhr, arguments);
                            }
                        } else {
                            xhr[attr] = f;
                        }
                    }
                }
                function hookfun(fun) {
                    return function () {
                        let args = [].slice.call(arguments)
                        if (funs[fun] && funs[fun].call(this, args, this.xhr)) {
                            return;
                        }
                        return this.xhr[fun].apply(this.xhr, args);
                    }
                }
                return window._ahrealxhr;
            }

            // 拦截fetch请求
            function _fetch(){
                if(!window.fetch) return;
                let _fetch     = fetch 
                window.fetch   = function(){
                    let _arg   = arguments
                    let result = fetArg(_arg)
                    if(result.type !== 'report-data'){
                        clearPerformance()
                        conf.ajaxMsg.push(result)
                        conf.fetLength   = conf.fetLength+1;
                        conf.haveFetch   = true
                    }
                    return _fetch.apply(this, arguments)
                    .then((res)=>{ 
                        if(result.type === 'report-data') return;
                        getFetchTime('success')
                        return res 
                    })
                    .catch((err)=>{ 
                        if(result.type === 'report-data') return;
                        getFetchTime('error')
                        //error
                        let defaults    = Object.assign({},errordefo);
                        defaults.t      = new Date().getTime();
                        defaults.n      = 'fetch'
                        defaults.msg    = 'fetch request error';
                        defaults.method = result.method
                        defaults.data   = {
                            resourceUrl:result.url,
                            text:err.stack||err,
                            status:0
                        }
                        conf.errorList.push(defaults)
                        return err  
                    });
                }
            }

            // fetch arguments
            function fetArg(arg){
                let result={ method:'GET',type:'fetchrequest' }
                let args = Array.prototype.slice.apply(arg)

                if(!args || !args.length) return result;
                try{
                    if(args.length === 1){
                        if(typeof(args[0])==='string'){
                            result.url      = args[0]
                        }else if(typeof(args[0])==='object'){
                            result.url      = args[0].url
                            result.method   = args[0].method
                        }
                    }else{
                        result.url      = args[0]
                        result.method   = args[1].method
                        result.type     = args[1].type
                    }
                }catch(err){}
                return result;
            }

            // 拦截js error信息
            function _error(){
                // img,script,css,jsonp
                window.addEventListener('error',function(e){
                    let defaults    = Object.assign({},errordefo);
                    defaults.n      = 'resource'
                    defaults.t      = new Date().getTime();
                    defaults.msg    = e.target.localName+' is load error';
                    defaults.method = 'GET'
                    defaults.data   = {
                    target: e.target.localName,
                    type: e.type,
                    resourceUrl:e.target.currentSrc,
                    };
                    if(e.target!=window) conf.errorList.push(defaults)
                },true);
                // js
                window.onerror = function(msg,_url,line,col,error){
                    let defaults        = Object.assign({},errordefo);
                    setTimeout(function(){
                        col = col || (window.event && window.event.errorCharacter) || 0;
                        defaults.msg    = error && error.stack ?error.stack.toString():msg
                        defaults.method = 'GET'
                        defaults.data   = {
                            resourceUrl:_url,
                            line:line,
                            col:col
                        };
                        defaults.t      = new Date().getTime();
                        conf.errorList.push(defaults)
                    },0);
                };
            }

            // ajax统一上报入口
            function ajaxResponse(xhr,type){
                let defaults    = Object.assign({},errordefo);
                defaults.t      = new Date().getTime();
                defaults.n      = 'ajax'
                defaults.msg    = xhr.statusText || 'ajax request error';
                defaults.method = xhr.method
                defaults.data   = {
                    resourceUrl:xhr.responseURL,
                    text:xhr.statusText,
                    status:xhr.status
                }
                conf.errorList.push(defaults)
            }

            // fetch get time
            function getFetchTime(type){
                conf.fetchNum+=1
                if(conf.fetLength === conf.fetchNum){
                    if(type=='success'){
                        console.log('走了 fetch success 方法')
                    }else{
                        console.log('走了 fetch error 方法')
                    }
                    conf.fetchNum = conf.fetLength = 0
                    fetchTime = new Date().getTime()-beginTime
                    getLargeTime();
                }
            }

            // ajax get time
            function getAjaxTime(type){
                conf.loadNum+=1
                if(conf.loadNum === conf.ajaxLength){
                    if(type=='load'){
                        console.log('走了AJAX onload 方法')
                    }else if(type=='readychange'){
                        console.log('走了AJAX onreadystatechange 方法')
                    }else{
                        console.log('走了 error 方法')
                    }
                    conf.ajaxLength = conf.loadNum = 0
                    ajaxTime = new Date().getTime()-beginTime
                    getLargeTime();
                }
            }

            function clearPerformance(type){
                if(!window.performance && !window.performance.clearResourceTimings) return;
                if(conf.haveAjax&&conf.haveFetch&&conf.ajaxLength==0&&conf.fetLength==0){
                    clear()
                }else if(!conf.haveAjax&&conf.haveFetch&&conf.fetLength==0){
                    clear()
                }else if(conf.haveAjax&&!conf.haveFetch&&conf.ajaxLength==0){
                    clear()
                }
            } 
            function clear(){
                performance.clearResourceTimings();
                conf.performance    = {}
                conf.errorList      = []
                conf.preUrl         = ''
                conf.resourceList   = ''
                conf.page           = location.href
                ERRORLIST           = []
                ADDDATA             = []
            }
        }catch(err){}}`;

        return script;
    }

    async setSYSTEMredis(appId) {
        const json = {
            is_use: 0,
            slow_page_time: 5,
            slow_js_time: 2,
            slow_css_time: 2,
            slow_img_time: 2,
            slow_ajax_time: 2,
            is_statisi_pages: 0,
            is_statisi_ajax: 0,
            is_statisi_resource: 0,
            is_statisi_system: 0,
            is_statisi_error: 0,
            _id: '5bb47beb779be91d13e91fd6',
            create_time: '2018-10-03T08:20:59.793Z',
            system_domain: 'blog.seosiwei.com',
            system_name: 'zaneblog',
            app_id: 'D3D9B9AA45B56F6E424F57EFB36B063B',
            user_id: [],
            script: '',
            __v: 0,
        };
        this.app.redis.set(appId, JSON.stringify(json));
    }
}

module.exports = WebPerformanceScriptService;
