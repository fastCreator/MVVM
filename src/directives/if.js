

export const directiveIf = {
    template2Vnode: function (el, directive) {

    },
    vnode2render: function (el, genElement) {
        var exp = el.if.expression;
        return `${exp}?${genElement(el)}:''`;
    }
}