//环境
//hasProto
//定义
//noop
//no
//def
//转换
//domTostr
//strTodom
//判断
//isDom
//isObject
//isNative
//isPlainObject
//isNonPhrasingTag
//isFunction
//hasOwn 
//工具
//bind
//warn
//nextTick
//_set
//cached
//操作对象
//remove
//parsePath 
export function isFunction(obj) {
    return typeof obj === 'function'
}

export function cached(fn) {
    const cache = Object.create(null)
    return function cachedFn(str) {
        const hit = cache[str]
        return hit || (cache[str] = fn(str))
    }
}

function copyProperties(target, source) {
    for (let key of Reflect.ownKeys(source)) {
        if (key !== "constructor"
            && key !== "prototype"
            && key !== "name"
        ) {
            let desc = Object.getOwnPropertyDescriptor(source, key);
            Object.defineProperty(target, key, desc);
        }
    }
}
//标签
export const isNonPhrasingTag = makeMap(
    'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
    'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
    'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
    'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
    'title,tr,track'
)
//创建一个映射并返回一个函数，以检查键是否在该映射中。
export function makeMap(str, expectsLowerCase) {
    const map = Object.create(null)
    const list = str.split(',')
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true
    }
    return expectsLowerCase
        ? val => map[val.toLowerCase()]
        : val => map[val]
}

export const no = () => false

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

export function bind(fn, ctx) {
    function boundFn(a) {
        const l = arguments.length
        return l
            ? l > 1
                ? fn.apply(ctx, arguments)
                : fn.call(ctx, a)
            : fn.call(ctx)
    } 
    boundFn._length = fn.length
    return boundFn
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