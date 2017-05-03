import { makeFunction } from './helpers'

const fnExpRE = /^\s*([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/
const simplePathRE = /^\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?']|\[".*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*\s*$/
const modifierCode = {
    stop: '$event.stopPropagation();',
    prevent: '$event.preventDefault();',
    self: 'if($event.target !== $event.currentTarget)return;',
    ctrl: 'if(!$event.ctrlKey)return;',
    shift: 'if(!$event.shiftKey)return;',
    alt: 'if(!$event.altKey)return;',
    meta: 'if(!$event.metaKey)return;'
}

const keyCodes = {
    esc: 27,
    tab: 9,
    enter: 13,
    space: 32,
    up: 38,
    left: 37,
    right: 39,
    down: 40,
    'delete': [8, 46]
}

export default function codeGen(ast) {

    const code = ast ? genElement(ast) : '_h("div")'

    return makeFunction(`with(this){return ${code}}`)
}

function genElement(el) {
    //设置值  作用域
    if (el.for && !el.forProcessed) {
        return genFor(el)
    } else if (el.if && !el.ifProcessed) {
        return genIf(el)
    } else {
        let code
        //设置属性 等值
        const data = genData(el)
        const children = genChildren(el, true)
        code = `_h('${el.tag}'${
            data ? `,${data}` : '' // data
            }${
            children ? `,${children}` : '' // children
            })`
        return code
    }
}

function genChildren(el, checkSkip) {
    const children = el.children
    if (children.length) {
        const el = children[0]
        // optimize single v-for
        if (children.length === 1 &&
            el.for) {
            return genElement(el)
        }
        const normalizationType = 0
        return `[${children.map(genNode).join(',')}]${
            checkSkip
                ? normalizationType ? `,${normalizationType}` : ''
                : ''
            }`
    }
}

function genIf(el) {
    el.ifProcessed = true // avoid recursion
    return genIfConditions(el.ifConditions.slice())
}

function genIfConditions(conditions) {
    if (!conditions.length) {
        return "''"
    }

    var condition = conditions.shift()
    if (condition.exp) {
        return `(${condition.exp})?${genTernaryExp(condition.block)}:${genIfConditions(conditions)}`
    } else {
        return `${genTernaryExp(condition.block)}`
    }

    // v-if with v-once should generate code like (a)?_m(0):_m(1)
    function genTernaryExp(el) {
        return genElement(el)
    }
}

function genFor(el) {
    const exp = el.for
    const alias = el.alias
    const iterator1 = el.iterator1 ? `,${el.iterator1}` : ''
    const iterator2 = el.iterator2 ? `,${el.iterator2}` : ''
    el.forProcessed = true // avoid recursion

    return `_l((${exp}),` +
        `function(${alias}${iterator1}${iterator2}){` +
        `return ${genElement(el)}` +
        '})'
}

function genNode(node) {
    if (node.type === 1) {
        return genElement(node)
    } else {
        return genText(node)
    }
}

function genText(text) {
    return text.type === 2 ? text.expression : JSON.stringify(text.text)
}

function genData(el) {
    let data = '{'

    // attributes
    if (el.attrs) {
        data += `attrs:{${genProps(el.attrs)}},`
    }
    // DOM props
    if (el.props) {
        data += `props:{${genProps(el.props)}},`
    }
    // event handlers
    if (el.events) {
        data += `${genHandlers(el.events)},`
    }
    if (el.nativeEvents) {
        data += `${genHandlers(el.nativeEvents, true)},`
    }

    data = data.replace(/,$/, '') + '}'

    return data
}

function genProps(props) {
    let res = ''
    for (let i = 0; i < props.length; i++) {
        const prop = props[i]
        res += `"${prop.name}":${prop.value},`
    }
    return res.slice(0, -1)
}

function genHandlers(events, native) {
    let res = native ? 'nativeOn:{' : 'on:{'
    for (const name in events) {
        res += `"${name}":${genHandler(name, events[name])},`
    }
    return res.slice(0, -1) + '}'
}

function genHandler(name, handler) {
    if (!handler) {
        return 'function(){}'
    } else if (Array.isArray(handler)) {
        return `[${handler.map(handler => genHandler(name, handler)).join(',')}]`
    } else if (!handler.modifiers) {
        return fnExpRE.test(handler.value) || simplePathRE.test(handler.value)
            ? handler.value
            : `function($event){${handler.value}}`
    } else {
        let code = ''
        const keys = []
        for (const key in handler.modifiers) {
            if (modifierCode[key]) {
                code += modifierCode[key]
            } else {
                keys.push(key)
            }
        }
        if (keys.length) {
            code = genKeyFilter(keys) + code
        }
        const handlerCode = simplePathRE.test(handler.value)
            ? handler.value + '($event)'
            : handler.value
        return 'function($event){' + code + handlerCode + '}'
    }
}

function genKeyFilter(keys) {
    return `if(${keys.map(genFilterCode).join('&&')})return;`
}

function genFilterCode(key) {
    const keyVal = parseInt(key, 10)
    if (keyVal) {
        return `$event.keyCode!==${keyVal}`
    }
    const alias = keyCodes[key]
    return `_k($event.keyCode,${JSON.stringify(key)}${alias ? ',' + JSON.stringify(alias) : ''})`
}