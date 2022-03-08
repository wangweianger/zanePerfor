# github登录授权

## 一：登录github

## 二：依次进入： Settings -> Developer settings -> New OAuth App -> Register a new OAuth application

你会看到如下界面：

![](https://github.com/wangweianger/zanePerfor/blob/master/demo/20.png)

> Homepage URL: 你的根域名，也就是location.origin
> Authorization callback URL: github授权成功之后的回调域名，这里的地址后缀必须是 /api/v1/github/callback

## 三：注册成功之后进入OAuth Apps，进入创建好的应用获取Client ID 和 Client Secret。


### 项目中配置授权参数

- 进入项目的`config/config.default.js` 和 `config/config.prod.js` 配置相应的参数

```js
// github login
config.github = {
	// github Client ID
    client_id: 'xxxxxx',

    // github Client Secret
    client_secret: 'xxxxxx',

    // 此参数表示只获取用户信息
    scope: [ 'user' ],
};
```

END!