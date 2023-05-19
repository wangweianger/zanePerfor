## Vue 项目使用SDK：

- 进去app目录下public文件夹，解压web-report-vue-min.zip。将里面的文件复制到自己项目下,找到public文件夹或者根目录文件夹下的index.html。添加以下代码:

```js
   <script src ="./web-report-vue-min.js"></script>
   <script defer>
   window.Performance({
      domain: `http://report.com/api/v1/report/web`, //此处的report.com指你自己部署的域名，假如是本机启动填127.0.0.1
      add: {
        appId: "ZzdSi3P1683682161087XXX",
     },
   });
  </script>
  ```

这里向大家分享一下不同环境下使用的方法: 

- Vue2: 可以在 **.env.build** 等环境配置文件配置环境变量，例如： `VUE_APP_BASE_URL=/abc/index`

```js
<script src="<%= VUE_APP_BASE_URL %>/cdn/sdk/web-report-axios.min.js"></script>
<script defer>
window.Performance({
        domain: '<%= VUE_APP_BASE_URL %>/api/v1/report/web',
        add: {
          appId: 'Ac3pkKd1675993494568',
        },
      });
</script>
```

- Vue3: 可以在 **.env.build** 等环境配置文件配置环境变量，例如： `VITE_BUILD_HOST = 'http://xxxxx:7001'`

- 然后在Vite.config.ts中新增插件：createHtmlPlugin -> npm install createHtmlPlugin -D。然后在plugins中配置以下代码

```js
createHtmlPlugin({
        minify: true,
        pages: [
        {
            // entry: "src/main.ts",
            filename: "index.html",
            template: "index.html",
            injectOptions: {
            data: {
                // title: "index",
                injectScript: `<script type ="module" src="/src/utils/inject.ts" defer></script>`,
            },
            },
        },
        ],
    }),
```

在src下的utils文件夹新增文件inject.ts

```js
window.Performance({
    domain: `${window._process_env.VITE_BUILD_HOST}/api/v1/report/web`,
    add: {
    appId: "ZzdSi3P1XXXX2161087",
    },
});
```

这样就可以动态的引入各个环境的域名前缀，部署到各个环境啦。

