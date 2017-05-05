import { noop, warn } from '../utils'

export const dirRE = /^v-|^@|^:/
export const forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/
export const forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/
export const onRE = /^@|^v-on:/
export const bindRE = /^:|^v-bind:/
export const modifierRE = /\.[^.]+/g

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
export function getAndRemoveAttr(el, name) {
    let val
    if ((val = el.attrsMap[name]) != null) {
        const list = el.attrsList
        for (let i = 0, l = list.length; i < l; i++) {
            if (list[i].name === name) {
                list.splice(i, 1)
                break
            }
        }
    }
    return val
}
//{name:key,value:value} to {key:value}
export function makeAttrsMap(attrs) {
    const map = {}
    for (let i = 0, l = attrs.length; i < l; i++) {
        map[attrs[i].name] = attrs[i].value
    }
    return map
}

export function addAttr(el, name, value) {
    (el.attrs || (el.attrs = [])).push({ name, value })
}

export function addProp(el, name, value) {
    (el.props || (el.props = [])).push({ name, value })
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


