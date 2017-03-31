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

        return fragment.replace(taglib_each_reg, function (allstr, key, item, inner, $4) {
//            console.log("allstr", allstr)
//            console.log("key", key)
//            console.log("item", item)
            console.log("inner", inner)
            var val = get_value(vars, key)
            var i, temp = "";
//            console.log("val", val);
            for (i in val) {
                if (val.hasOwnProperty(i)) {
                    vars[item] = val[i];// 设置临时变量供render 遍历循环
                    temp += render(inner, vars);
                }
            }
            vars[item] = null;// 清除临时变量
            return temp;
        }).replace(taglib_if_reg, function (allstr, key, staticValue, inner) {
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
            var val = get_value(vars, key);
            if (val || val === 0) {
//                return meta == '%' ? scrub(val) : val;
                return  val;
            }
            return "";
        });
    }
    jsptpl.prototype.render = function (vars) {
        return render(this.jsptpl, vars);
    };
    window.jsptpl = jsptpl;
})()
