/* 
 _           _   _   _     
 (_)         | | | | (_)    
 _ ___ _ __ | |_| |  _ ___ 
 | / __| '_ \| __| | | / __|
 | \__ \ |_) | |_| |_| \__ \
 | |___/ .__/ \__|_(_) |___/
 _/ |   | |          _/ |    
 |__/    |_|         |__/     
 
 * 
 jsptl.js
 基于jsp jstl语法的模版引擎
 @author gonghongyu <gonghongyu@le.com>
 @version 0.0.1
 **/

(function () {
    var taglib_jsp_reg = /\$\{(.+?)\}/g;
//    var taglib_each_reg = /<[c|t]:forEach[\s]*items=["|']\$\{(.+?)\}.*[\s]+?var=["|'](.+?)["|'].*>([\s\S]+?)<\/[c|t]:forEach>/g;
    var taglib_each_reg = /<[c|t]:forEach[\s]*items=["|']\$\{(.+?)\}.*[\s]+?var=["|'](.+?)["|'].*>([\s\S]*)<\/[c|t]:forEach>/g;
    var taglib_if_reg = /<[c|t]:if[\s]*test=["|']\$\{(.+?)=(.+)\}["|']+?>([\s\S]+?)<\/[c|t]:if>/g;
    // ps * 与 +? v 的区别 * 无法逐条匹配，第一个表填头和若干条后的最后一个标签尾部匹配,+? 则能逐条匹配（已经吐血）
    // ps .+ 与 .+? 的区别 .+可以匹配至下一条规则为止 .+?只匹配一个字符
    function jsptpl(template) {
        this.jsptpl = template;
    }
    function get_value(vars, key) {
        var parts = key.split('.');
        while (parts.length) {
            if (vars != null) {
                if (!(parts[0] in vars)) {
                    return false;
                }
                vars = vars[parts.shift()];
            } else {
                return false;
            }
        }
//        console.log(vars)
        return vars;
    }
    function render(fragment, vars) {
//        console.log("开始新的匹配 源字符串", fragment)
        var tagret = fragment.tagsearchTop("c:forEach", function (content, sstart, eend, p) {
//            console.log("循环之前 已经匹配上：", content)
            var tag_return = content.replace(taglib_each_reg, function (allstr, key, item, inner, $4) {
//                console.log("inner", inner)
//                console.log("item", item)
                var val = get_value(vars, key)
                var i, temp = "";
                for (i in val) {
                    if (val.hasOwnProperty(i)) {
                        var obj = {};
                        obj[item] = val[i];
//                        console.log("开始render..")
                        temp += render(inner, obj);
                    }
                }
//                vars[item] = null;// 清除临时变量
//                console.log("返回的变量:", temp)
                return temp;
            })
//            console.log("tag 替换内部函数返回: ", tag_return);
            return  tag_return;
        });
//        console.log("tag search 结果", tagret);
        return     tagret.replace(taglib_if_reg, function (allstr, key, staticValue, inner) {
            console.log("=============iftest==========")
            console.log("allstr", allstr)
            console.log("key", key)
            console.log("staticValue", staticValue)
            staticValue = staticValue.replace(/['|"]/g, "");
            var val = get_value(vars, key)
            if ((val + "") == staticValue) {
                return render(inner, vars);
            }
            return "";
//            var val = get_value(vars, key)
        }).replace(taglib_jsp_reg, function (allstr, key) {
//            console.log(" 进去到最后的数据转换。。。", allstr)
            var val = get_value(vars, key);
            if (val || val === 0) {
//                return meta == '%' ? scrub(val) : val;
                return  val;
            }
            return "";
        });
    }
    ;
    jsptpl.prototype.render = function (vars) {
        return render(this.jsptpl, vars);
    };
    window.jsptpl = jsptpl;
})()
