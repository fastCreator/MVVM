export function domTostr(dom) {
    var div = document.createElement("div");
    div.appendChild(dom);
    return div.innerHTML
}

export function strTodom(str) {
    var div = document.createElement('div');
    div.innerHTML = str;
    return div.firstChild;
}

export function isDom(dom) {
    return dom instanceof HTMLElement;
}

export function bind(src, el) {
    document.querySelector(el).innerHTML = src;
}

export function isObject(obj) {
    return obj !== null && typeof obj === 'object'
}

export function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key)
}
