/**
 * Created by yebo on 2016/11/10.
 */
//加载样式
require('../../theme/uplus.scss');
require('./components.scss');

var lazyUtil = require("../../components/utils/lazyUtil");
var _lazyUtil =lazyUtil.getInstance();
var change = function () {
    var anchor = _lazyUtil.getAnchor(location.href)
    if (anchor) {
        try {
            require("bundle-loader!../../components/" + anchor + "/demo")((Test) => {
                if ($(".components-base a[href='#" + anchor + "']").get(0)) {
                    $(".components-base a[href='#" + anchor + "']").addClass("active");
                }
                var test = new Test();
                if (test.init) {
                    test.init();
                }
            })
        } catch (err) {
            console.log(err);
        }
    } else {
        $(".menu-root ul li").eq(0).trigger("click");
    }
}
$.get("./conf/components.json", function (data, status) {
    var anchor = _lazyUtil.getAnchor(location.href)
    $(".menu-root ul").html("");
    if (data) {
        data.map(function (obj) {
            $(".menu-root ul").append('<li class="sidebar-item"><a href="#'+obj.path+'" class="sidebar-link">'+obj.name+'</a></li>')
        })
        $(".menu-root ul li").each(function () {
            $(this).click(function () {
                $(".menu-root ul li.current").removeClass("current");
                $(this).addClass("current");
                window.location = $(this).find("a").attr("href");
            })
            if($(this).find("a").attr("href")=="#"+anchor){
                $(this).addClass("current");
            }
        })
        $(window).bind('hashchange', change);
        change();
    }
})
$(".sidebar-item").each(function(){
    $(this).click(function(){
        $(".sidebar-item.current").removeClass("current");
        $(this).addClass("current")
    })
})
$(".section-link").each(function(){
    $(this).click(function(){
        $(".section-link.active").removeClass("active");
        $(this).addClass("active")
    })
})
