## Minix

一个简单的微信小程序状态管理组件

> 因为使用了一些App、Page、Component的方法，所以对版本有一些要求：第一种是程序中没有使用插件，那么可以兼容低版本。第二种是项目中使用了插件，那么基础库版本最好在2.6.5以上，同时依赖开发者工具的 npm 构建。具体详情可查阅[官方 npm 文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html)。


## 使用方法

1、安装 Minix:

```
npm install --save wx-minix
```


2、引入 Minix:


在App中导入一次即可
```js
require('wx-minix')
App{
    store:{
        //要管理的状态
        state:{
            num:1,
            sum:1
        },
        //每个页面都需要的状态
        states:['num']
    }
}

```


支持Page和Component,Page方法相同
```js
Component{
    //在本页面中管理的状态
    states:['sum'],
    //本页面禁止的全局状态（App中states需要禁止的）
    disableStates:[],
    //同样支持Computed
    computed:{
        x(){
            return this.data.state.num+10;
        }
    }
}
```

状态同步的结果放在data的state中
```wxml
<view>num:{{state.num}}</view>
```

改变状态
```
getApp().store.commit('num',3)
```









