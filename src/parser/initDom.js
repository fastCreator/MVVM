

import { parseHTML } from './html-parser'

import { patch, h } from '../vnode'
import TextParser from './text-parser'
import {
    dirRE,
    forAliasRE,
    forIteratorRE,
    onRE,
    bindRE,
    modifierRE,
    addIfCondition,
    getAndRemoveAttr,
    makeAttrsMap,
    addAttr,
    addProp,
    addHandler,
    parseModifiers,
    processIfConditions
} from './helpers'

export function initDom(vm) {
    var opt = vm.$options,
        ss = opt.splitStart || '{',
        se = opt.splitEnd || '}',
        temp = document.scripts[opt.from].innerText,
        $el = document.querySelector(opt.to);
    var results = "";

    let currentParent;
    let root
    let stack = []
    //unary  <br/>
    function processFor(el) {
        let exp
        if ((exp = getAndRemoveAttr(el, 'm-for'))) {
            const inMatch = exp.match(forAliasRE)
            if (!inMatch) {
                warn(`Invalid v-for expression: ${exp}`)
                return
            }
            el.for = inMatch[2].trim()
            const alias = inMatch[1].trim()
            const iteratorMatch = alias.match(forIteratorRE)
            if (iteratorMatch) {
                el.alias = iteratorMatch[1].trim()
                el.iterator1 = iteratorMatch[2].trim()
                if (iteratorMatch[3]) {
                    el.iterator2 = iteratorMatch[3].trim()
                }
            } else {
                el.alias = alias
            }
        }
    }

    parseHTML(temp, {
        start: function (tag, attrs, unary) {
            const element = {
                type: 1,
                tag,
                attrsList: attrs,
                attrsMap: makeAttrsMap(attrs),
                parent: currentParent,
                children: []
            }
            processFor(element)
            // processIf(element)
            // processKey(element)
            // processAttrs(element)

            if (!root) {
                root = element
            }

            if (currentParent) {
                currentParent.children.push(element)
                element.parent = currentParent
            }

            if (!unary) {
                currentParent = element
                stack.push(element)
            }
        },
        end: function (tag) {
            const element = stack[stack.length - 1]
            const lastNode = element.children[element.children.length - 1]
            if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
                element.children.pop()
            }
            // pop stack
            stack.length -= 1
            currentParent = stack[stack.length - 1]
        },
        chars: function (text) {
            if (!text.trim()) {
                text = ' '
            }
            let expression = TextParser(text, ['{{', '}}'])
            if (expression) {
                currentParent && currentParent.children.push({
                    type: 2,
                    expression,
                    text
                })
            } else {
                currentParent && currentParent.children.push({
                    type: 3,
                    text
                })
            }

        }
    });

    // var vnode = h('div#container.two.classes', { on: { click: function () { } } }, [
    //     h('span', { style: { fontWeight: 'bold' } }, 'This is bold'),
    //     ' and this is just normal text',
    //     h('a', { props: { href: '/foo' } }, '111111111111111111111111')
    // ]);
    // var newVnode = h('div#container.two.classes', { on: { click: function () { } } }, [
    //     h('span', { style: { fontWeight: 'normal', fontStyle: 'italic' } }, 'This is now italic type'),
    //     ' and this is still just normal text',
    //     h('a', { props: { href: '/bar' } }, '2222222222222222222222222222')
    // ]);
    function codeGen(ast) {
        //生成render函数字符串
        const code = ast ? genElement(ast) : '_h("div")'
        //返回render函数
        return makeFunction(`with(this){return ${code}}`)
    }
    //生成函数
    function makeFunction(code) {
        try {
            return new Function(code)
        } catch (e) {
            return noop
        }
    }
    //生成元素
    function genElement(el) {
        if (el.for && !el.forProcessed) {
            return genFor(el)
        } else if (el.if && !el.ifProcessed) {
            return genIf(el)
        } else {
            let code
            const data = genData(el);

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
    //之前解析了m-for 
    //el.exp 值 name
    //el.alias item name
    //el.iterator1 key name
    //el.iterator2 index name
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
        console.log(el)
        // 用户自定义
        if (el.attrsList) {
            data += `attrs:{${genProps(el.attrsList)}},`
        }
        // 原生自带
        if (el.props) {
            data += `props:{${genProps(el.attrsList)}},`
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
    //获取字符串属性
    function genProps(props) {
        let res = ''
        for (let i = 0; i < props.length; i++) {
            const prop = props[i]
            res += `"${prop.name}":${prop.value},`
        }
        console.log(props)
        console.log(res.slice(0, -1))
        return res.slice(0, -1)
    }
    //获取字符串 函数
    function genHandlers(events, native) {
        let res = native ? 'nativeOn:{' : 'on:{'
        for (const name in events) {
            res += `"${name}":${genHandler(name, events[name])},`
        }
        return res.slice(0, -1) + '}'
    }
    //字符串 函数handler
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
    console.log(codeGen(root))
    console.log($el)
    var a = {
        _h: h
    }
    var el = patch($el, codeGen(root).bind(a)());
    // console.log(el);
    // patch(vnode, newVnode);
}




function processFor(el) {
    let exp
    if ((exp = getAndRemoveAttr(el, 'v-for'))) {
        const inMatch = exp.match(forAliasRE)
        if (!inMatch) {
            warn(`Invalid v-for expression: ${exp}`)
            return
        }
        el.for = inMatch[2].trim()
        const alias = inMatch[1].trim()
        const iteratorMatch = alias.match(forIteratorRE)
        if (iteratorMatch) {
            el.alias = iteratorMatch[1].trim()
            el.iterator1 = iteratorMatch[2].trim()
            if (iteratorMatch[3]) {
                el.iterator2 = iteratorMatch[3].trim()
            }
        } else {
            el.alias = alias
        }
    }
}