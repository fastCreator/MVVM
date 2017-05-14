

export const directiveIf = {
    template2Vnode: function (el, directive) {

    },
    vnode2render: function (el, genElement) {
        var exp = el.if.expression;
        //if (el.isComponent) return `${genElement(el)}`;
        return `${exp}?${genElement(el)}:''`;
    }
}