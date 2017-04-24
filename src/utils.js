//环境
//hasProto
//定义
//noop
//def
//转换
//domTostr
//strTodom
//判断
//isDom
//isObject
//isNative
//isPlainObject
//hasOwn
//生成
//bind
//工具
//warn
//nextTick
//_set
//操作对象
//remove
//parsePath

const OBJECT_STRING = '[object Object]'
export function isPlainObject(obj) {
    return toString.call(obj) === OBJECT_STRING
}

export const isNative = function (Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

export const _Set = (function () {
    let _Set
    if (typeof Set !== 'undefined' && isNative(Set)) {
        _Set = Set
    } else {
        _Set = class Set {
            constructor() {
                this.set = Object.create(null)
            }
            has(key) {
                return this.set[key] === true
            }
            add(key) {
                this.set[key] = true
            }
            clear() {
                this.set = Object.create(null)
            }
        }
    }
    return _Set;
})()

const bailRE = /[^\w.$]/
export function parsePath(path) {
    if (bailRE.test(path)) {
        return
    }
    const segments = path.split('.')
    return function (obj) {
        for (let i = 0; i < segments.length; i++) {
            if (!obj) return
            obj = obj[segments[i]]
        }
        return obj
    }
}
export function remove(arr, item) {
    if (arr.length) {
        const index = arr.indexOf(item)
        if (index > -1) {
            return arr.splice(index, 1)
        }
    }
}


export const nextTick = (function () {
    const callbacks = []
    let pending = false
    let timerFunc

    function nextTickHandler() {
        pending = false
        const copies = callbacks.slice(0)
        callbacks.length = 0
        for (let i = 0; i < copies.length; i++) {
            copies[i]()
        }
    }

    if (typeof Promise !== 'undefined' && isNative(Promise)) {
        var p = Promise.resolve()
        var logError = err => { console.error(err) }
        timerFunc = () => {
            p.then(nextTickHandler).catch(logError)
        }
    } else if (typeof MutationObserver !== 'undefined' && (
        isNative(MutationObserver) ||
        MutationObserver.toString() === '[object MutationObserverConstructor]'
    )) {
        var counter = 1
        var observer = new MutationObserver(nextTickHandler)
        var textNode = document.createTextNode(String(counter))
        observer.observe(textNode, {
            characterData: true
        })
        timerFunc = () => {
            counter = (counter + 1) % 2
            textNode.data = String(counter)
        }
    } else {
        timerFunc = () => {
            setTimeout(nextTickHandler, 0)
        }
    }

    return function queueNextTick(cb, ctx) {
        let _resolve
        callbacks.push(() => {
            if (cb) {
                try {
                    cb.call(ctx)
                } catch (e) {
                    warn(ctx)
                }
            } else if (_resolve) {
                _resolve(ctx)
            }
        })
        if (!pending) {
            pending = true
            timerFunc()
        }
        if (!cb && typeof Promise !== 'undefined') {
            return new Promise((resolve, reject) => {
                _resolve = resolve
            })
        }
    }
})()

export function warn(msg, vm) {
    console.error(`[MVVM warn]: ${msg}`);
}

export const hasProto = '__proto__' in {}

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

export function noop() { }

export function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
    })
}