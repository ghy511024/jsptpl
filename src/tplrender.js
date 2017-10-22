/*
 *  _           _         _ 
 (_)         | |       | |
 _ ___ _ __ | |_ _ __ | |
 | / __| '_ \| __| '_ \| |
 | \__ \ |_) | |_| |_) | |
 | |___/ .__/ \__| .__/|_|
 _/ |   | |       | |      
 |__/    |_|       |_|      
 
 * 
 *jsptl.js  基于jsp jstl语法的模版引擎
 *@author gonghongyu <gonghongyu@le.com>
 *@version 0.0.1
 * **/

(function () {
    var taglib_jsp_reg = /\$\{(.+?)\}/g;
    var taglib_each_reg = /<[c|t]:forEach[\s]*items=["|']\$\{(.+?)\}.*?[\s]+?var=["|'](.+?)["|'].*?>([\s\S]*)<\/[c|t]:forEach>/g;
    var taglib_if_reg = /<[c|t]:if\s+test=\s*(["|'])\$\{(.+?=?.+)\}\1+?>([\s\S]+?)<\/[c|t]:if>/g;
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
        return vars;
    }
    ;
    // 目前这一版本 此方法传入最基础的表达式 a=="xxx",之类的，暂时只支持 == 和 true false 的运算，返回也是 true 或者false
    function getExpress_value(vars, express) {
        var spreg = /(.*?)(==|>=|<=|>|<)(.*)/g;
        var reg = /^[\d]+$|(?=(['"]).*?\1|true|false)/g;
        var array = [];
        var cond;
        express.replace(spreg, function (_, key1, exp, key2) {
            array.push(key1);// 表达式左边字符串
            array.push(key2);// 表达式右边字符串
            cond = exp;// 条件表达式
        })
        var ret = false;

        if (array.length > 1) {
            if (!reg.test(array[0])) {
                array[0] = get_value(vars, array[0])
            } else {
                array[0] = array[0].replace(/['"]/g, "");
            }
            if (!reg.test(array[1])) {
                array[1] = get_value(vars, array[1])
            } else {
                array[1] = array[1].replace(/['"]/g, "");
            }
            if (cond != null) {
                try {
                    if (cond == "==") {
                        ret = array[0] == array[1];
                    } else {
                        ret = eval("(" + array[0] + cond + array[1] + ")");
                    }
                }
                catch (e) {
                    ret = false
                }
            }
        } else {
            ret = get_value(vars, express)
        }
        return ret;
    }
    ;
    function render(fragment, vars) {
        var tagret = fragment.tagsearchTop("c:forEach", function (content, sstart, eend, p) {
            var tag_return = content.replace(taglib_each_reg, function (allstr, key, item, inner, $4) {
                var val = get_value(vars, key)
                var i, temp = "";
                for (i in val) {
                    
                    if (val.hasOwnProperty(i)) {
                        var obj = {};
                        obj[item] = val[i];
                        temp += render(inner, obj);
                    }
                }
                return temp;
            })
            return  tag_return;
        });
        return  tagret.replace(taglib_if_reg, function (allstr, _, express, inner) {
            var check = false;
            var a1 = express.split("&&");
            for (var i = 0; i < a1.length; i++) {
                var item = a1[i];
                var a2 = item.split("||");
                if (a2.length > 1) {
                    for (var j = 0; j < a2.length; j++) {
                        a2[j] = getExpress_value(vars, a2[j])
                    }
                    a1[i] = a2.join("||");
                } else {
                    a1[i] = getExpress_value(vars, a2[0])
                }
            }
            var ret_express = a1.join("&&");// 返回 true&&false||true 这种格式的字符串。
            try {
                check = eval("(" + ret_express + ")");
//                console.log("(" + ret_express + ")");
            }
            catch (e) {
                check = false;
            }
//            console.log("校验结果", check);
            if (check) {
                return render(inner, vars);
            }
            return "";
        }).replace(taglib_jsp_reg, function (allstr, key) {
            var val = get_value(vars, key);
            if (val || val === 0) {
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
