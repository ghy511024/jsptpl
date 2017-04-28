/*
 * 
 *渲染模版
 * **/

(function () {
    var taglib_jsp_reg = /\$\{(.+?)\}/g;
    var taglib_each_reg = /<[c|t]:forEach[\s]*items=["|']\$\{(.+?)\}.*[\s]+?var=["|'](.+?)["|'].*>([\s\S]*)<\/[c|t]:forEach>/g;
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
        return     tagret.replace(taglib_if_reg, function (allstr, _, express, inner) {
            try {
                eval()
            }
            catch (e) {

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
