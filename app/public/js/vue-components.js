/* eslint-disable */

let Component = {
    commonsearch:{
        template: `<div class="component_search mr20">
            <a href="/selectype"><button class="btn btn-main">+添加应用</button></a>
            <div class="select">
                <span class="times"><span class="iconfont">&#xe60b;</span>{{timeText}}<span class="iconfont">&#xe63b;</span></span>
                <div class="select-time">
                    <li data-time="60000" data-text="最近1分钟">1分钟</li>
                    <li data-time="300000" data-text="最近5分钟">5分钟</li>
                    <li data-time="600000" data-text="最近10分钟">10分钟</li>
                    <li data-time="1800000" data-text="最近30分钟">30分钟</li>
                    <li data-time="3600000" data-text="最近1小时">1小时</li>
                    <li data-time="21600000" data-text="最近6小时">6小时</li>
                    <li data-time="43200000" data-text="最近12小时">12小时</li>
                    <li data-time="86400000" data-text="最近1天">1天</li>
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
            let selecttimes = util.getStorage('local', 'userselectTime') || 60000
            let objs = $('.select-time li')
            for(let i=0,len=objs.length;i<len;i++){
                let times = $(objs[i]).attr('data-time')
                let text = $(objs[i]).attr('data-text')
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








