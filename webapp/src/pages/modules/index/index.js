/**
 * Created by yebo on 2016/12/28.
 */
require("./index.scss");
var sidebar,tempShelf,formUtil
class Index extends $$Module {
    init() {
        this.load([
            "specific/navigate/navigate",
            "specific/footer/footer",
            "specific/loginPanel/loginPanel",
            "specific/dropDownPanel/dropDownPanel",
            "base/sidebar/sidebar",
            "specific/tempShelf/tempShelf",
            "services/systemService",
            "utils/mixCryptoUtil",
            "utils/formUtil",
            "services/localStorageService"
        ], (Navigate, Footer, LoginPanel, DropDownPanel,Sidebar,TempShelf,SystemService,MixCryptoUtil,FormUtil,LocalStorage) => {
            /*
            FormUtil.getInstance().downLoadFile({
                url:"/api/icons/images",
                data:{
                    icons:"sss,201706290027243347595544254.svg;"
                }
            })*/

            sidebar = Sidebar;
            tempShelf = TempShelf;
            formUtil = FormUtil;
        	var systemService = new SystemService();
        	this.localStorage = new LocalStorage();

            //加载导航
        	this.navigate = new Navigate({
                el: "#index_nav_container",
                menus: $$.config.menus
            });
            this.userFunc(DropDownPanel,LoginPanel,Sidebar,TempShelf,FormUtil,MixCryptoUtil,systemService);

            //加载尾部控件
            new Footer({
                el: "#index_footer_container",
            });

            $(window).trigger("hashchange");

        })
    }
    render() {
        return require("./index.ejs")();
    }

   userFunc(DropDownPanel,LoginPanel,Sidebar,TempShelf,FormUtil,MixCryptoUtil,systemService) {
    systemService.getUserInfo((data) => {
        if (data.data) {
            this.userId = data.data.userid;
            $('#loginin').hide();
            $('#logout').show();
            $('#logout span').html(data.data);
            let ddp = new DropDownPanel({
                el:"#logout",
                items:[
                    {
                        name:"上传图片",
                        href:"#common/dropDownPanel"
                    },
                    {
                        name:"后台管理",
                        cb:function(){
                            alert("个人中心回调");
                        }
                    },
                    {
                        name:"退出登录",
                        cb:function(){
                            systemService.logout((data) => {
                                window.location.reload();
                            });
                        },
                        render:function(item){
                            return item.name;
                        }
                    }
                ]
            });
        }
        else {
            this.userId = "visitor";
            $('#loginin').show();
            $('#logout').hide();
            // 用户登录
            let lp1 = new LoginPanel({
                el:"#loginin",
                username:{
                    maxLength:12
                },
                password:{
                    maxLength:12
                },
                forget:"#common/loginPanel",
                //地址与回调可以任选一个,存在forgetCb则默认回调
                forgetCb:function(){
                    alert("忘记密码回调");
                },//
                login:()=>{
                    var conElement = $("#loginin").next();
                    var username = conElement.find('input').eq(0).val();
                    var password = conElement.find('input').eq(1).val();
                    password = new MixCryptoUtil.getInstance().encrypt(password);
                    //console.log(new MixCryptoUtil.getInstance().decrypt("23e46bc3718de92161e011dad9b0ee58"));
                    console.log(password);
                    var params = {
                        "username": username,
                        "password": password,
                    };
                    systemService.login(params, (data)=>{
                        $('#logout span').html(data.data.REAL_NAME);
                        lp1.hide();
                        this.userFunc(DropDownPanel,LoginPanel,Sidebar,TempShelf,FormUtil,MixCryptoUtil,systemService);
                    }, function(err) {
                        console.log(err);
                    });
                }
            });
        }
        this.tempShelfAction(TempShelf,FormUtil);
    }, function(err) {
        console.log(err);
    });
}
    tempShelfAction(TempShelf,FormUtil){
        this.tempShelfData = new Array(); //存储暂存夹的本地数据
        this.tempShelfImg = new Array(); //存储img的src
        var tempShelfDataStr = this.localStorage.getLocalStorageItem(this.userId + "_tempShelf");
        if(tempShelfDataStr){
            this.tempShelfData = tempShelfDataStr.split(";");
            for(let k = 0 ;k < this.tempShelfData.length ; k++ ){
                if(this.tempShelfData[k]){
                    let _tempObj = {};
                    _tempObj.src ="/i/"+this.tempShelfData[k].split(",")[2];
                    _tempObj.iconId =this.tempShelfData[k].split(",")[0];
                    this.tempShelfImg.push(_tempObj);
                }
            }
            this.tempShelfNum = this.tempShelfData.length-1;
        }else{
            this.tempShelfNum =0;
        }
        this.navigate.setMessageNum(this.tempShelfNum);
        this.showSidebar(TempShelf,FormUtil);
    }
    showSidebar(TempShelf,FormUtil){
        $(".messageBox").click(()=>{
            $("#index_tempShelf_container").children().remove();
            let sideTempShelf  =  new TempShelf({
                el: "#index_tempShelf_container",
                data: this.tempShelfImg,
                deleteOne:(id)=>{
                    console.log(id);
                    this.localStorage.deleteInfoById(this.userId + "_tempShelf",id);
                    this.tempShelfAction(TempShelf,FormUtil);
                },
                downloadAll:()=>{
                    console.log("downloadAll");
                    let tempPara = '';
                    for(let j = 0;j < this.tempShelfNum;j++){
                        let _tempParaArr = this.tempShelfData[j].split(",");
                        tempPara = tempPara+_tempParaArr[1]+","+_tempParaArr[2]+";";
                    }
                    FormUtil.getInstance().downLoadFile({
                        url:"/api/icons/images",
                        data:{
                            icons:tempPara
                        }
                    })
                },
                deleteAll:()=>{
                    console.log("deleteAll");
                    this.localStorage.clearLocalStorage(this.userId + "_tempShelf");
                    this.tempShelfAction(TempShelf,FormUtil);
                }
            });

            $("#index_tempShelf_container").css("display","block");
        })
    }
    /*    newSidebar(Sidebar,TempShelf,FormUtil){
        let sidebar = new Sidebar({
            containerId: 'index_tempShelf_container',
            title: '暂存架',
            length: this.tempShelfNum,
            content: '<div id = "tempShelf" class = "tempShelf"></div>',
            isMasked: true,
            batchDownload:()=>{
                let tempPara = '';
                for(let j = 0;j < this.tempShelfNum;j++){
                    let _tempParaArr = this.tempShelfData[j].split(",");
                    tempPara = tempPara+_tempParaArr[1]+","+_tempParaArr[2]+";";
                }
                FormUtil.getInstance().downLoadFile({
                    url:"/api/icons/images",
                    data:{
                        icons:tempPara
                    }
                })
            },
            deleteAll:()=>{
                console.log("delete all icons of tempshelf");
                this.localStorage.clearLocalStorage(this.userId + "_tempShelf");
                this.tempShelfAction(Sidebar,TempShelf,FormUtil);
                sidebar.setNum(this.tempShelfNum);
            }
        });
        sidebar.open();
        new TempShelf({
            el: "#tempShelf",
            data: this.tempShelfImg,
            deleteOne:(id)=>{
                this.localStorage.deleteInfoById(this.userId + "_tempShelf",id);
                this.tempShelfAction(Sidebar,TempShelf,FormUtil);
                sidebar.setNum(this.tempShelfNum);
        }
        })
    }*/

    resize() {

    }

    destroy() {
        console.log("回收主模块")
    }
    handleMessage(message) {
        if (message.type == "hashchange") {
            var anchor = message.data.anchor;
            var innerAnchor = message.data.innerAnchor;
            var param = message.data.param;
            if (this.anchor != anchor||this.__parameter!=param.__parameter) {
                this.anchor=anchor
                this.__parameter=param.__parameter;
                if (this.anchor) {
                    this.bind("index_container", anchor, param);
                    this.navigate.setCurrent(anchor);
                } else {
                    this.navigate.setCurrent("iconLib/standardLib");
                    this.bind("index_container", $$.config.menus[1].module, param);
                }
            }
        }
        if(message.type == "tempShelfAdd"){
            console.log("tempShelfAdd");
            this.tempShelfAction(tempShelf,formUtil)
        }
    }
}
module.exports = Index;