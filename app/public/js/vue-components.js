/* eslint-disable */

let Component = {
    commonsearch:{
        template: `<div class="search">
            <a href="/addSystem"><button class="cursor">+添加应用</button></a>
            <div class="select">
                <span class="times"><span class="iconfont">&#xe66c;</span>{{timeText}}<span class="iconfont">&#xe698;</span></span>
                <div class="select-time">
                    <li data-time="0" data-text="全部">全部</li>
                    <li data-time="0.5" data-text="最近30分钟">30分钟</li>
                    <li data-time="1" data-text="最近1小时">1小时</li>
                    <li data-time="6" data-text="最近6小时">6小时</li>
                    <li data-time="12" data-text="最近12小时">12小时</li>
                    <li data-time="24" data-text="最近1天">1天</li>
                    <li data-time="72" data-text="最近3天">3天</li>
                    <li data-time="168" data-text="最近7天">7天</li>
                    <button @click="timeSure" class="btn">确定</button>
                </div>
            </div>
        </div>`,
        props:{
            done:{
                type:Function,
                default:()=>{}
            },
        },
        data:function(){
            return{
                timeText:'全部'
            }
        },
        mounted(){
            let _this=this;
            // 添加active样式
            let selecttimes = util.getStorage('local','userselectTime')||0
            let objs = $('.select-time li')
            for(let i=0,len=objs.length;i<len;i++){
                let times = $(objs[i]).attr('data-time')
                let text = $(objs[i]).attr('data-text')
                times = times*60*60*1000
                if(times == selecttimes){
                    _this.timeText = text
                    $(objs[i]).addClass('active')
                }
            }
            // active样式
            $('.times').on('click',(e) => {
                e.stopPropagation();
                $('.select-time').show();
            });
            $(document).on('click',function(e){
                $('.select-time').hide();
            });
            $('.select-time').click(function(e){
                e.stopPropagation();
            })
            $('.select-time li').on('click',function(e){
                $('.select-time li').removeClass('active')
                $(this).addClass('active')
                let time = $(this).attr('data-time')
                let text = $(this).attr('data-text')
                _this.timeText = text
                time = time*60*60*1000
                util.setStorage('local','userselectTime',time)
            })
        },
        methods:{
            timeSure(){
                $('.select-time').hide();
                this.done&&this.done()
            }
        },
    }
}
for(let n in Component){
    Vue.component(n, Component[n])
}








