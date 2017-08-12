# UPlus

U+开放平台

> 通过积极参与U+开放平台的建设，希望诸位能深入理解前端组件化，让我们更快乐的工作

## 一. 编译/运行

### node安装

[http://nodejs.cn/](http://nodejs.cn/e)

### cnpm安装

这是npmjs.org 国内镜像，代替官方版本

运行以下命令：

``` 
> npm install cnpm -g
``` 

### 开发环境安装
运行以下命令：
``` 
> git config --global user.name 'YourName'
> git config --global user.email 'YourName@hikvision.com.cn'
> git config --global http.sslVerify false
> git clone https://YourName@git.hikvision.com.cn/scm/publicsecurity/uplus.git
> cd uplus/uplus-sword
> cnpm install
```

### 编译

开发模式下，启动webpack编译脚本，生成目录为：bin/public

``` 
> cd uplus/uplus-sword
> npm run build
```
### 发布

生产模式下，启动webpack发布脚本，生成目录为：dist

``` 
> cd uplus/uplus-sword
> npm run release
```
### server服务启动

开发模式下，可启动自带的www服务进行测试，指向bin/public目录

``` 
> cd uplus/uplus-sword
> npm run server
```

注意：如果运行run server时出现nodemon报错，请另行安装nodemon

```
> npm install nodemon -g
```


## 二. 模块化

基于webpack实现前端要素的模块化，在此，需要理解模块与组件在概念上的微妙差异：

> 组件由模块构成，模块是前端开发要素的最小单元，不可再分。

举个例子：下拉列表是一个组件，其目录下包含的dropList.js,dropList.css,dropList.ejs为构成其实现的三个模块。

![Alt text](https://git.hikvision.com.cn/projects/PUBLICSECURITY/repos/uplus/browse/uplus-sword/doc/images/rm_mod.png?at=4ea5075ab1a613853ab7bc313dcf2d802b74ce7b&raw)

### JS模块化

模块的定义需符合CommonJS规范，并采用ES6语法书写。

### CSS模块化

通过引入Sass预编译语言来实现，后缀为.scss

### HTML模块化

通过引入ejs模板定义语言来实现，后缀为.ejs，ejs作为dom结构的基本载体，在此基础上，可以通过第三方框架支持扩展标签

## 三. 组件化

一切皆组件：把复杂系统拆分成多个组件，分离组件边界和责任，便于独立升级和维护

1. 单个组件包括模板，数据结构，程序，样式四部份。
2. 组件的接口表达了由该组件提供的功能和调用它时所需要的参数。
3. 组件是可以单独开发、测试。允许多人同时协作，编写及开发、研究不同的功能模块。

根据组件职责不同，框架进行了划分，主要包括框架组件，工具组件，UI组件以及功能组件（包括子功能组件）

![Alt text](https://git.hikvision.com.cn/projects/PUBLICSECURITY/repos/uplus/browse/uplus-sword/doc/images/rm_component.png?at=bdeec96420610e362914a168b582340ff45ca12a&raw)

### 框架组件
 
> /src/components/core/app.js

框架管理组件，负责非框架组件的加载，功能组件生命周期管理（功能组件销毁，初始化等）

> /src/components/core/module.js

功能组件的父类，框架组件需要管理功能组件，因此，所有的功能组件需要继承该类，以便纳入管理
``` javascript
class MyModule extends $$Module{
   ....
}
```
### 工具组件(非可视化组件)

> /src/components/utils

例如时间处理，图片等比例压缩，加密解密等

### UI组件 

UI组件分为两类：基础组件和业务组件
> /src/components/base
> /src/components/specific

对于多功能间通用的组件，我们可以封装成UI组件，也就是说，只要有一处以上的场景需要复用，我们都建议提炼成UI组件

### 功能组件 

> /src/pages/modules

通常，功能组件就是需要面向最终用户的界面，它由多个组件构成。

有一种情况，功能组件很复杂，由多个部分构成，但是多个部分又是全局唯一的，不具有可复用性，此时，我们便可以把一个
功能组件拆分成多个子功能组件，有效降低模块复杂度。

#### 生命周期

![Alt text](https://git.hikvision.com.cn/projects/PUBLICSECURITY/repos/uplus/browse/uplus-sword/doc/images/rm_life.png?at=c4ddd6485f83a668b20a76673f357dc46b1986df&raw)

1. 功能组件加载后，先调用render方法，绑定dom元素到容器中，需要子类自行实现

2. 调用init方法进行初始化，包括对DOM的后续更新等，需要子类自行实现

3. 窗体尺寸改变时，resize方法会被触发，需要子类自行实现

4. 通过load方法加载UI/工具组件，通过bind方法加载子功能组件，已由父类实现

5. fetch方法负责发送请求，满足前后端通讯需求，已由父类实现

6. sendMessage方法负责给消息总线发送请求，已由父类实现

7. handleMessage方法能监听到消息总线转发的请求，需要子类自行实现消息处理逻辑，sendMessage与handleMesseage机制解决了功能组件之间的通讯问题，使得功能组件之间可以解耦

8. 当场景切换时，当前功能组件被移除之前，框架会自动调用当前功能组件中包含的子功能组件的unfetch和destroy方法，以便销毁，然后才会调用功能组件自身的unfetch和destroy方法，销毁自己。

#### 组件间通讯

![Alt text](https://git.hikvision.com.cn/projects/PUBLICSECURITY/repos/uplus/browse/uplus-sword/doc/images/rm_message.png?at=822f1f0a569bbdd4b92a08651a0ff015f181a064&raw)

如上图所示：

1. UI组件作为功能组件的直接组成部分，不能脱离功能组件而独立存在，因此，UI组件的状态更新不需要经过消息总线全局广播，而是经由功能组件进行更新。

2. 功能组件之间耦合度不高，不存在必然的逻辑关系，当需要进行状态同步时（比如打开新建对话框，当保存成功时，需要通知列表刷新），可经由消息总线实现功能组件间通讯

##### 功能组件与UI组件通讯

1.UI组件接口定义
``` javascript
  class SearchInput extends $$Component {
      constructor(options) {
          super();
          this.options = options || {};
          ......
      }
      render() {
          ......
      }
      setData(data){
         //Do something to reset state
      }
      doSomething(){
             var data;
             //Do something to Change data's value
             ......
             //trigger OnEnter
             if(this.options.onEnter){
               this.options.onEnter(data);
               //UI组件继承$$Component基类，具有派发事件的能力
               this.emit("uOnEnter",data)
             }
      }
  }
  module.exports=SearchInput
```



3.功能组件创建UI组件并调用接口
``` javascript
  class Index extends $$Module {
      init() {
          this.load(["base/searchInput/searchInput"],(SearchInput)=>{
               this.searchInput=new SearchInput({
                  el:"#index_container"
                  onEnter:(data)=>{
                     //获取UI组件事件回调参数，并进行后续处理，此处是输入的搜索关键字。
                  }
               })
               //通过组件方法更新组件状态
               this.searchInput.setData("更新搜索关键字")
               //通过指定事件监听获取组件状态
               this.on("onEnter",function(evt){
                   
               ));
          });
          
      }
      render() {
          return '<div id="index_container"></div>'
      }
      resize() {
      }
      destroy() {
         
      }
  }
  module.exports=Index
```
##### 功能组件与功能组件通讯

1.功能组件1发送消息
``` javascript
  class Index extends $$Module {
      init() {
          ......
          this.doSomething();
          ......
          this.doOtherthing();
      }
      doSomething(){
          //发送消息,内部实现通过全局总线发送
          this.sendMessage({msgType:"yapovich",msgObj:{content:"yapovich亲启的飞鸽传书"}})
      }
      doOtherthing(){
          //发送消息,内部实现通过全局总线发送
          this.sendMessage({msgType:"yinchuan",msgObj:{content:"yinchuan亲启的飞鸽传书"}})
      }
      ......
  }
  module.exports=Index
``` 
2.功能组件2接受消息
``` javascript
  class Yapovich extends $$Module {
      ......
      //定义消息处理函数
      handleMessage(message){
         if(message.msgType=="yapovich"){
            console.log("信上都说了些啥？"+message.content)
         }
      }
      ......
  }
  module.exports=Yapovich
``` 
3.功能组件3接受消息
``` javascript
  class Yinchuan extends $$Module {
      ......
      //定义消息处理函数
      handleMessage(message){
         if(message.msgType=="yinchuan"){
             onsole.log("信上都说了些啥？"+message.content)
          }
      }
      ......
  }
  module.exports=Yinchuan
``` 
## 四. 目录结构解析
``` 
      |--src
      |    |--components   //组件
      |    |     |--base   //UI组件-基础组件
      |    |     |--core   //框架组件
      |    |     |--utils  //工具组件
      |    |     |--specific //UI组件-业务组件
      |    |--conf  //配置文件
      |    |--icons  //图标资源
      |    |     |--png  //用于雪碧图的图标资源
      |    |     |--svg  //用于font的图标资源
      |    |--pages  //入口及页面
      |    |     |--entry  //启动入口
      |    |     |     |--start.js  //启动入口文件，webpack将从该脚本开始静态扫描和编译
      |    |     |     |--start.ejs  //启动页模板，index.html自动生成时需要读取
      |    |     |--errors  //错误页面
      |    |     |     |--images
      |    |     |     |    |--404.png  //404页面背景图
      |    |     |     |--404.ejs  //404错误页面
      |    |     |     |--errors.scss  //错误页样式
      |    |     |--modules  //页面（功能组件）
      |    |     |     |--index
      |    |     |     |     |--feedbackController.js
      |    |     |     |     |--index.ejs
      |    |--theme  //主题样式
      |    |--vendor //第三方插件
      
```
## 五.创建/加载功能组件

### 创建功能组件模板

> src/pages/modules/helloWorld/helloWorld.ejs

``` html
  <div>Hello,Uplus</div>
``` 
### 创建功能组件逻辑

> src/pages/modules/helloWorld/helloWorld.js

``` javascript
class HelloWorld extends $$Module{
    //组件初始化
    init(){
    }
    //组件预渲染
    render(){
       return require("./helloWorld.ejs")(this.$$parameter)
    }
    //尺寸变化监听
    resize(){
    }
    //模块移除监听
    destroy(){
    }
}
``` 
### 加载功能组件

> src/pages/modules/index/feedbackController.js

``` javascript
class Index extends $$Module {
    init() {
        //父类提供了bind方法用以实现id和功能组件的绑定操作
        //参数1：containerId 容器ID
        //参数2：moduleName 功能模块名，此处helloWorld的代表路径是：modules/helloWorld/helloWorld.js
        this.bind("index_container","helloWorld")
    }
    render() {
        return '<div id="index_container"></div>'
    }
    resize() {
    }
    destroy() {
       
    }
}
module.exports=Index
``` 
## 六.创建/加载UI组件

### 创建UI组件模板(以基础组件为例)

> src/components/base/list/list.ejs

``` html
  <ul>
      <% for(var i = 0;i < list.length;i++){ %>
      <li>
         <%= list[i].label %>
      </li>
      <% } %>
  </ul>
``` 
### 创建UI组件逻辑(以基础组件为例)

> src/components/base/list/list.js

``` javascript
class List extends $$Component{
    constructor(options) {
       super();
       this.options = options || {};
       if (this.options.el) {
         $(this.options.el).html(this.render());
       }
    }
    render(){
       return require("./list.ejs")(this.options);
    }
    
}
module.exports=List
```


### 加载UI组件

> src/pages/modules/index/feedbackController.js

``` javascript
class Index extends $$Module {
    init() {
        this.load(["base/list/list"],(List)=>{
             this.list=new List({
                el:"#index_container"
                list:[{label:"title1"},{label:"title2"}]
             })
        });
        
    }
    render() {
        return '<div id="index_container"></div>'
    }
    resize() {
    }
    destroy() {
       
    }
}
module.exports=Index
```
## 七. 样式

![Alt text](https://git.hikvision.com.cn/projects/PUBLICSECURITY/repos/uplus/browse/uplus-sword/doc/images/rm_style.png?at=7c5c1e58711e56845d1f64b256b6ba3963e930e7&raw)

样式分为基础设计样式和组件样式，基础设计样式负责覆盖浏览器默认样式，提供常用样式定义，比如常用间距数值的样式mr10(margin:10px)，浮动，

清除浮动以及CSS预编译函数定义，组件样式为基础设计样式基础上对组件自身布局和背景颜色等进行定义。

样式目录结构解析如下：

``` 
      |--src
      |    |--components
      |    |     |--base  //UI组件-基础组件
      |    |     |     |--button
      |    |     |     |     |--......
      |    |     |     |     |--button.scss  //UI组件样式
      |    |--icons  //图标资源
      |    |     |--png  //用于雪碧图的图标资源
      |    |     |     |--icon.png  //自动生成的雪碧图
      |    |--pages //入口及页面
      |    |     |--entry  //启动入口
      |    |     |     |--......
      |    |     |     |--start.scss  //启动页样式
      |    |     |--errors  //错误页面
      |    |     |     |--......
      |    |     |     |--errors.scss  //错误页样式
      |    |     |--modules  //页面（功能组件）
      |    |     |     |--index
      |    |     |     |     |--......
      |    |     |     |     |--index.scss  //页面样式
      |    |--theme  //主题样式
      |    |     |--base.scss  //基础样式
      |    |     |--dev.scss  //组件开发所需样式
      |    |     |--sprites.scss  //自动生成的雪碧图样式
      |    |     |--uplus.scss  //页面开发所需样式
      |    |     |--variables.scss  //预编译变量定义
```

> 组件的样式与脚本，DOM结构将会编译在一个脚本文件中，按需动态加载&lt;style&gt;标签，基础设计样式将会整体打包成一个css样式文件

## 八.路由系统

框架实现了一个简易的单页面路由系统，通过监听window的onhashchange事件来简单实现(app.js)，所有功能组件，只要实现了hashChange方法，

都能在锚点路由发生变化的时候被调用，根据获取到的锚点路由值和参数值，进行内部状态的更新，但一般情况下，单页面应用中，只有首页负责路由，

其他的功能组件都是通过首页功能组件的路由动态加载到当前场景，举个例子：

URL地址：localhost:3000/#detail?id=11

源代码路径：src/pages/module/index/feedbackController.js

``` javascript
class Index extends $$Module {
    init() {
        //当功能组件加载完成时，当前路由和参数会被自动保存到模块的
        //$$hash参数和$$parameter参数中,此处，
        //this.$$hash="detail",
        //this.$$parameter={id:11}
        //初始调用的时机由功能组件自己掌握，框架不主动调用，以适应异步调用的场景
        this.hashChange(this.$$hash,this.$$parameter)
    }
    render() {
        return '<div id="index_container"></div>'
    }
    resize() {
    }
    destroy() {
       
    }
    //当路由发生变化时，功能组件自动执行hashChange，并提供最新的路由和参数。
    hashChange(anchor,param){
       this.bind("index_container",auchor,param)
    }
}
module.exports=Index
``` 
## 九. 组件demo

### 1. 编写组件示例(以基础组件为例)

> src/components/base/list/demo/demo.js

``` javascript
  class Test(
      //运行时，会自动调用该方法
      init(){
          //内部编写调用组件的相关代码
          require.ensure(["./list"],(require)=>{
              var List=require("./list")
              new List({
                 el:"#container" //测试主页面中已包含该ID容器
                 list:[{label:"title1"},{label:"title2"}]
              })
          });
      }
  }
  module.exports=Test
``` 
### 2. 扫描测试用例

运行以下命令：
``` 
> npm run test
``` 
### 3. 运行测试用例

访问：http://localhost:3000/components.html

将会在左侧菜单中加载所有编写了测试用例(test.js)的组件，此例中，会生成一个List菜单项，点击即可查看List组件的测试用例效果


## 十. 服务端开发
### 环境
1. 服务器地址： 10.33.42.69 
2. 数据表文档： [U+系统数据表设计](https://git.hikvision.com.cn/projects/PUBLICSECURITY/repos/uplus/browse/uplus-sword/bin/conf/databaseTables.md)

## 十一. 开发任务及进度管理
1. 前端开发任务管理及进度跟踪地址：https://trello.com/b/95vz584t/-
2. 服务端开发任务管理及进度跟踪地址： https://trello.com/b/xIuz0htb/-



<br/><br/><br/>

###### 更新日志

|更新内容                          |修改人   |修改原因|修改时间   |
|------------------------------|--------|----------|----------|
|创建并初始化文档  |叶波        |初始化          |          |
|新增“十. 服务端开发”、“十一. 开发任务及进度管理”章节  |尹川        |补充          |          |
|更新“三、组件化”、“四. 目录结构解析”、“五.创建/加载功能组件”、“六.创建/加载UI组件”、“七. 样式”、“八.路由系统”、“九. 组件demo”等章节的内容   |尹川        |工程目录重构          |2017-07-09|