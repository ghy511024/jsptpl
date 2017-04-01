/* 
 * @desc 标签查找算法 用于解决 js 正则不支持平衡数组/递归匹配 的问题。
 * 主要用途是用于，匹配闭合嵌套具有标签特性结构的字符。用来解析html,编写爬虫程序，编写模版引擎等。
 *@author ghy
 *@contact qq:249398279
 */
(function () {
// 标签查找 此方法与正则中的 平衡组/递归匹配 效果差不多，只是js 正则不支持平衡组匹配。所以用原生方法实现
// ps 此方法返回的标签顺序是按照闭标签出现顺序为序的，压栈弹栈算法（正则中的平衡数组匹配也会是这个顺序，平衡数组的核心算法也是压栈式的）
// 下面还有一个算法 tagShedSort 来重新排序 tagShedSort 返回的则是正常从上往下，从外到里的顺序。
    var tagshed = function (str, tag) {
        var tagarray = [];
        var cindex = 0;
        var shed = function () {// 标签栈
        }
        shed.prototype = {
            c: "", // 内容
            po: 0, // 深度位置标记，用于出栈后数组第二次排序
            pnode: null,
            findEnd: function (str) {
//                console.log(str)
                var p1 = str.indexOf("<" + tag); // 第一次开标签出现位置
                var p2 = str.indexOf("</" + tag); // 第一次闭标签出现位置
                var p3 = str.indexOf("<" + tag, str.indexOf("<" + tag) + 1); // 第二次开标签出现位置
                var p4 = str.indexOf("</" + tag, str.indexOf("</" + tag) + 1); // 第二次闭标签出现位置
//                console.log("find position", p1, p2, p3, p4, str.length, cindex, str);
                var h = new shed();
                if (p1 >= 0 && p1 < p2) {// 开标签开始

                    if (this.pnode != null && p1 > 0) {
                        // 处理两个兄弟节点中间的部分。这部分容易遗漏。
                        var tmpstr = str.substring(0, p1);
                        this.pnode.append(tmpstr);
                    }
                    if (p3 > 0 && p3 < p2) { //开标签开始 开标签结束 入栈
                        var cstr = str.substring(p1, p3);
                        var retstr = str.substring(p3);
                        h.pnode = this;
                        h.po = this.po + 1;
                        this.s = cindex + p1;
                        cindex += p3;
                        this.append(cstr);
                        h.findEnd(retstr);
                    } else {//开标签开始 闭标签结束
                        var cstr = str.substring(p1, p2 + tag.length + 3);
                        var retstr = str.substring(p2 + tag.length + 3);
                        this.s = cindex + p1;
                        cindex += (p2 + tag.length + 3)
                        this.e = cindex;
                        this.append(cstr)
                        if (this.pnode != null) {
                            h.pnode = this.pnode;
                            h.po = this.po;
                        }
//                        console.log("开-闭===", this.c, this.po)
                        var obj = {
                            p: this.po,
                            c: this.c,
                            s: this.s,
                            e: this.e,
                        }
                        tagarray.push(obj)
                        h.findEnd(retstr);
                    }
                } else if ((p2 >= 0 && p1 < 0) || p2 < p1) {// 开始就是闭标签
                    var cstr = str.substring(0, p2 + tag.length + 3);
                    var retstr = str.substring(p2 + tag.length + 3);
                    cindex += p2 + tag.length + 3;
                    this.append(cstr);
                    this.pnode.e = cindex;
                    var obj = {
                        p: this.pnode.po,
                        c: this.pnode.c,
                        e: this.pnode.e,
                        s: this.pnode.s,
                    }
                    tagarray.push(obj)
                    if (p4 > 0 && (p4 < p1 || p1 < 0)) {// 存在第二个闭标签，并且开标签不存在或者在第二个闭标签之后 闭闭
//                        this.append(cstr);
                        if (this.pnode != null) {
//                            console.log("闭-闭-p===", this.pnode.c, this.pnode.po)
                            // 闭-闭 情况下，弹栈让父层来继续查找
                            this.pnode.findEnd(retstr);
                        }
                    } else if (p1 > 0 && (p4 < 0 || p1 < p4)) {// 存在开标签 闭开
                        if (this.pnode != null) {
//                            console.log("闭-开-p===", this.pnode.c, this.pnode.po)
                            // 闭-开 情况下，需要新开一个兄弟节点来查找
                            h.pnode = this.pnode.pnode;
                            h.po = this.pnode.po;
                            this.pnode = h;
                            h.findEnd(retstr);
                        }
                    } else {//闭标签开始，并且 不存在开也不存在闭 ，最后一个标签了
// 啥也不做了，最后一个结束标签
                    }
                }
                return "";
            }
            ,
            // 递归向所有父节点添加数据
            append: function (str) {
                this.c = this.c + str;
                if (this.pnode != null) {
                    this.pnode.append(str);
                } else {
                }
            },
        }
//        console.log("111:", tagarray)
        var sd = new shed();
        sd.findEnd(str);
//        console.log("222:", tagarray)
        for (var i = 0; i < tagarray.length; i++) {
//            console.log(tagarray[i]);
        }
        return tagarray;
    }

    var tagShedSort = function (arry) {
        if (arry == null || arry.length == 0) {
            return [];
        }
// 在指定区间内查找第一个出现的最小数，当区间每个数查找完后，区间的起始位置调整，直到遍历整个数组
// 目前只发现在标签匹配这种栈中会用到这种算法，其他的还没有找到什么地方会用到
        var retarray = []; // 用于存放结果
        var endShed = []; // 查找区间，结束端 栈
        endShed.push(arry.length)// 需要默认将数组长度放入栈中，不然最后一个，将无法查找
        // 存储已经取出的东西
        function tagsort(array, b_po, e_po) {
            var po = find(array, b_po, e_po)
            retarray.push(array[po]);
            if (po > b_po) {
                endShed.push(po);
            }
//            console.log("position :", po, " value:", array[po]);
            if (po > b_po) {
                // 压栈式查找
                tagsort(array, b_po, po);
            } else {
//                     开始与结束紧挨着，需要调整起始位置并且弹栈
                if (e_po - b_po <= 1) {
                    b_po = endShed[endShed.length - 1] + 1
                    endShed.pop();
                    e_po = endShed[endShed.length - 1]
                } else {
                    // 结束位置并没有抵到开始位置，开始位置只需加1 即可
                    b_po = b_po + 1;
                }
                // 不断顺移 弹栈，可能栈中的头几位都是挨着开始数字的并且中间没有空隙，则这些都已经取过了，需要顺移弹栈，重新寻找起始位置和结束位置
                while (e_po <= b_po) {
                    b_po = e_po + 1;
                    endShed.pop();
                    e_po = endShed[endShed.length - 1]
                }
                if (endShed.length != 0) {
                    tagsort(array, b_po, e_po);
                }
            }
        }
        // 查找最小
        // 最大查找位置
        function find(array, bg, ed) {
            if (array[bg] == null) {
                return 0;
            }
            var c = array[bg].p;
            var ret = bg;
            for (var i = bg; i < ed; i++) {
                if (array[i].p < c) {
                    c = array[i].p
                    ret = i;
                }
            }
            return ret;
        }
        tagsort(arry, 0, arry.length)
        return retarray;
    }

    String.prototype.tagsearcha = function (tag, fun) {
        var tagarray = tagshed(this, tag) || [];
        var sorttag = tagShedSort(tagarray) || [];
        if (typeof fun == "function") {
            var tmpstr = this;
            for (var i = 0; i < sorttag.length; i++) {
                var ret = fun(sorttag[i].c, sorttag[i].s, sorttag[i].l)
//                this.replace(sorttag[i].c,);
//                console.log(this.search(sorttag[i].c), sorttag[i].c, fun(sorttag[i].c, sorttag[i].p))
            }
        }
    }
// 只返回顶层标签回调
    String.prototype.tagsearchTop = function (tag, fun) {
        var tagarray = new tagshed(this.toString(), tag) || [];
        var sorttag = new tagShedSort(tagarray) || [];
        var ret = this;
        if (typeof fun == "function") {
            var tmpstr = "";
            var e_str = "";
            var lend = 0
            if (sorttag.length > 0) {
                for (var i = 0; i < sorttag.length; i++) {
                    if (sorttag[i] && sorttag[i].p == 0) {
                        var b_str = this.substring(lend, sorttag[i].s);
                        e_str = this.substring(sorttag[i].e);
                        lend = sorttag[i].e;
                        var midstr = fun(sorttag[i].c, sorttag[i].s, sorttag[i].e, sorttag[i].p) || "";
                        tmpstr += b_str + midstr;
                    }
                }
                ret = tmpstr + e_str;
            } else {
                ret = this.toString();
            }
        }
        return ret;
    }
})();