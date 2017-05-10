export const directiveOn = {
    template2Vnode: function (el, dir) {
        //获取属性值
        let exp = dir.expression;
        if (exp.arg) {
            el.events[exp.arg] = exp.expression;
        }
    },
    vnode2render: function (el, genElement) {
        
    }
}