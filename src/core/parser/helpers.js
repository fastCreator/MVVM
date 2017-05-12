import { noop, warn, isBooleanAttr, isAttr } from '../utils'

export const dirRE = /^m-|^@|^:/
export const bindRE = /^:|^m-bind:/
export const modifierRE = /\.[^.]+/g
export const drictiveRE = /^m\-(\w+)(\:[^\.]+)?\.?([^\:]+)?/

//添加判断条件，是否显示
export function addIfCondition(el, condition) {
    if (!el.ifConditions) {
        el.ifConditions = []
    }
    el.ifConditions.push(condition)
}

export function parseModifiers(name) {
    const match = name.match(modifierRE)
    if (match) {
        const ret = {}
        match.forEach(m => { ret[m.slice(1)] = true })
        return ret
    }
}

//获取vnode中的中的属性[name],并且删除attrsList中改值
//删除值为了不再渲染自定义指令属性
export function removeAttr(el, name) {
    delete el.attrsMap[name];
}

//{name:key,value:value} to {key:value}
export function makeAttrsMap(attrs, delimiters) {
    const map = {}
    for (let i = 0, l = attrs.length; i < l; i++) {
        map[attrs[i].name] = attrs[i].value
    }
    return map
}
//获取指令 
export function setElDrictive(el, attrs) {
    for (let i = 0, l = attrs.length; i < l; i++) {
        let name = attrs[i].name;
        let darr = name.match(drictiveRE);
        if (darr) {
            //removeAttr(el, name)
            el[darr[1]] = {
                name: darr[1],
                expression: attrs[i].value,
                modifiers: split(darr[3]),
                arg: darr[2] && darr[2].slice(1)
            }
        }
    }
    function split(modifiers) {
        var map = {};
        var mod = modifiers && modifiers.split('.');
        if (mod) {
            mod.split('.').forEach(function (item, i) {
                map[item] = true;
            });
        }
        return map;
    }
}

//导出style
export function setElStyle(el) {
    var style = el.attrsMap.style;
    if (style) {
        removeAttr(el, 'style');
        el.style = {};
        style.split(';').forEach(function (item) {
            if (item) {
                let spi = item.split(':');
                el.style[spi[0]] = '"' + spi[1] + '"';
            }
        });
    }
}
//导出属性
export function setElAttrs(el, delimiters) {
    var s = delimiters[0], e = delimiters[1];
    var reg = new RegExp(`^${s}(\.+\)${e}$`); 
    var attrs = el.attrsMap;
    for (let key in attrs) {
        let value = attrs[key];
        var match = value.match(reg)
        if (match) {
            value = match[1];
            if (isAttr(key)) {
                el.props[key] = '_s('+value+')';
            } else {
                el.attrs[key] = value;
            }
        } else {
            if (isAttr(key)) {
                el.props[key] = "'" + value + "'";
            } else {
                el.attrs[key] = "'" + value + "'";
            }
        }

    }
}


export function addHandler(el, name, value, modifiers, important) {
    // check capture modifier
    if (modifiers && modifiers.capture) {
        delete modifiers.capture
        name = '!' + name // mark the event as captured
    }
    if (modifiers && modifiers.once) {
        delete modifiers.once;
        name = '~' + name; // mark the event as once
    }
    let events
    if (modifiers && modifiers.native) {
        delete modifiers.native
        events = el.nativeEvents || (el.nativeEvents = {})
    } else {
        events = el.events || (el.events = {})
    }
    const newHandler = { value, modifiers }
    const handlers = events[name]
    /* istanbul ignore if */
    if (Array.isArray(handlers)) {
        important ? handlers.unshift(newHandler) : handlers.push(newHandler)
    } else if (handlers) {
        events[name] = important ? [newHandler, handlers] : [handlers, newHandler]
    } else {
        events[name] = newHandler
    }
}
//
function findPrevElement(children) {
    let i = children.length
    while (i--) {
        if (children[i].tag && children[i].if) return children[i]
    }
}
//为了 esle ||else if
export function processIfConditions(el, parent) {
    const prev = findPrevElement(parent.children)
    if (prev) {
        addIfCondition(prev, {
            exp: el.elseif,
            block: el
        })
    } else {
        warn(
            `v-${el.elseif ? ('else-if="' + el.elseif + '"') : 'else'} ` +
            `used on element <${el.tag}> without corresponding v-if.`
        )
    }
}

export function makeFunction(code) {
    try {
        return new Function(code)
    } catch (e) {
        return noop
    }
}


