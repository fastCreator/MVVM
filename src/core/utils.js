//环境
//hasProto
//定义
//noop
//no
//def
//转换
//domTostr
//strTodom
//idToTemplate
//camelize
//capitalize 
//判断
//isDom
//isObject
//isNative
//isPlainObject
//isNonPhrasingTag
//isFunction
//isHTMLTag
//isSVG
//isAttr
//isBooleanAttr
//hasOwn 
//resolveAsset
//工具
//bind
//warn
//nextTick
//createElement
//_set
//cached
//操作对象
//remove
//parsePath 


export function createElement(tagName) {
    return document.createElement(tagName);
}


//判断是不是可移除属性
export const isAttr = makeMap(
    'accept,accept-charset,accesskey,action,align,alt,async,autocomplete,' +
    'autofocus,autoplay,autosave,bgcolor,border,buffered,challenge,charset,' +
    'checked,cite,class,code,codebase,color,cols,colspan,content,http-equiv,' +
    'name,contenteditable,contextmenu,controls,coords,data,datetime,default,' +
    'defer,dir,dirname,disabled,download,draggable,dropzone,enctype,method,for,' +
    'form,formaction,headers,height,hidden,high,href,hreflang,http-equiv,' +
    'icon,id,ismap,itemprop,keytype,kind,label,lang,language,list,loop,low,' +
    'manifest,max,maxlength,media,method,GET,POST,min,multiple,email,file,' +
    'muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,' +
    'preload,radiogroup,readonly,rel,required,reversed,rows,rowspan,sandbox,' +
    'scope,scoped,seamless,selected,shape,size,type,text,password,sizes,span,' +
    'spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,' +
    'target,title,type,usemap,value,width,wrap'
)

export const isBooleanAttr = makeMap(
    'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
    'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
    'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
    'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
    'required,reversed,scoped,seamless,selected,sortable,translate,' +
    'truespeed,typemustmatch,visible'
)

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
export const isHTMLTag = makeMap(
    'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template'
)

export const isSVG = makeMap(
    'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
    true
)

export function toString(val) {
    return val == null
        ? ''
        : typeof val === 'object'
            ? JSON.stringify(val, null, 2)
            : String(val)
}
const camelizeRE = /-(\w)/g
export const camelize = cached((str) => {
    return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
})

export const capitalize = cached((str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
})

//匹配组件名称的各种规则
export function resolveAsset(options, type, id) {
    /* istanbul ignore if */
    if (typeof id !== 'string') {
        return
    }
    let assets = options[type]
    if (!assets) {
        return
    }
    if (hasOwn(assets, id)) { return assets[id] }
    var camelizedId = camelize(id)
    if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
    var PascalCaseId = capitalize(camelizedId)
    if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
}

export const idToTemplate = cached((id) => {
    var el = query(id)


    return el && el.innerHTML
})


export function query(el) {
    if (typeof el === 'string') {
        const selector = el
        el = document.querySelector(el)
        if (!el) {
            return document.createElement('div')
        }
    }
    return el
}

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
                    warn('queueNextTick:'+ctx)
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