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
    function tagshed(str, tag) {
        var tagarray = [];
        var shed = function () {// 标签栈
        }
        shed.prototype = {
            c: "", // 内容
            po: 0, // 深度位置标记，用于出栈后数组第二次排序
            pnode: null,
            findEnd: function (str) {
                var p1 = str.indexOf("<" + tag);// 第一次开标签出现位置
                var p2 = str.indexOf("</" + tag); // 第一次闭标签出现位置
                var p3 = str.indexOf("<" + tag, str.indexOf("<" + tag) + 1); // 第二次开标签出现位置
                var p4 = str.indexOf("</" + tag, str.indexOf("</" + tag) + 1); // 第二次闭标签出现位置
//                    console.log("find position", p1, p2, p3, p4, str.length);
                var h = new shed();
                if (p1 >= 0 && p1 < p2) {// 开标签开始
                    if (p3 > 0 && p3 < p2) { //开标签开始 开标签结束 入栈
                        var cstr = str.substring(p1, p3);
                        var retstr = str.substring(p3);
                        h.pnode = this;
                        h.po = this.po + 1;
                        this.append(cstr)
                        h.findEnd(retstr);
                    } else {//开标签开始 闭标签结束
                        var cstr = str.substring(p1, p2 + tag.length + 2);
                        var retstr = str.substring(p2 + tag.length + 2);
                        this.append(cstr)
                        if (this.pnode != null) {
//                                    console.log("开-闭===", this.c, this.po)
                            var obj = {
                                p: this.po,
                                c: this.c
                            }
                            tagarray.push(obj)
                            h.pnode = this.pnode;
                            h.po = this.po;
                            h.findEnd(retstr);
                        }
                    }
                } else if ((p2 >= 0 && p1 < 0) || p2 < p1) {// 开始就是闭标签
                    var cstr = str.substring(0, p2 + tag.length + 2);
                    var retstr = str.substring(p2 + tag.length + 2);
                    if (p4 > 0 && p4 < p1) {// 闭闭
                        this.append(cstr);
                        if (this.pnode != null) {
//                                    console.log("闭-闭-p===", this.pnode.c, this.pnode.po)
                            var obj = {
                                p: this.pnode.po,
                                c: this.pnode.c
                            }
                            // 闭-开 情况下，需要新开一个兄弟节点来查找
                            tagarray.push(obj)
                            this.pnode.findEnd(retstr);
                        }
                    } else {// 闭开
                        this.append(cstr);
                        if (this.pnode != null) {
//                                    console.log("闭-开-p===", this.pnode.c, this.pnode.po)
                            // 闭-开 情况下，需要新开一个兄弟节点来查找
                            var obj = {
                                p: this.pnode.po,
                                c: this.pnode.c
                            }
                            tagarray.push(obj)
                            h.pnode = this.pnode.pnode;
                            h.po = this.pnode.po;
                            this.pnode = h;
                            h.findEnd(retstr);
                        }
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
            }
        }
        var sd = new shed();
        sd.findEnd(str);
        for (var i = 0; i < tagarray.length; i++) {
//            console.log(tagarray[i]);
        }
        return tagarray;
    }

    function tagShedSort(arry) {
        // 在指定区间内查找第一个出现的最小数，当区间每个数查找完后，区间的起始位置调整，直到遍历整个数组
        // 目前只发现在标签匹配这种栈中会用到这种算法，其他的还没有找到什么地方会用到
        var retarray = [];// 用于存放结果
        var endShed = [];// 查找区间，结束端 栈
        endShed.push(arry.length)// 需要默认将数组长度放入栈中，不然最后一个，将无法查找
        // 存储已经取出的东西
        function tagsort(array, b_po, e_po) {
            var po = find(array, b_po, e_po)
            retarray.push(array[po]);
            if (po > b_po) {
                endShed.push(po);
            }
//            console.log("position :", ret, " value:", array[ret]);
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
    String.prototype.tagsearch = function (tag, fun) {
        var tagarray = tagshed(this, tag) || [];
        var sorttag = tagShedSort(tagarray) || [];
        if (typeof fun == "function") {
            for (var i = 0; i < sorttag.length; i++) {
                this.replace(sorttag[i].c, fun(sorttag[i].c, sorttag[i].p));
            }
        }
    }
})();