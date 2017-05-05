import HTMLParser from './html-parser'
import TextParser from './text-parser'
import { hooks } from '../directives'
import codeGen from './codegen'
import { warn, camelize } from '../utils'
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

//缓存template解析之后的render函数
const cache = {}

export function compileToFunctions(template, vm) {
    let root
    let currentParent
    let options = vm.$options
    let stack = [];//记录当前节点位置:push,pop(树形)
    //直接获取render函数
    if (cache[template]) {
        return cache[template]
    }
    //通过John Resig 的 HTML Parser 解析template to vnode(自定义格式的Obejct，用于表示dom)
    //文档:http://ejohn.org/blog/pure-javascript-html-parser/
    //type 
    //1 标签 2 文本表达式 3 纯文本
    HTMLParser(template, {
        //标签开始部位,unary:true 自闭合标签 exp:<br/>;false 闭合标签 <a></a>
        start: function (tag, attrs, unary) {
            const element = {
                type: 1,
                tag,
                //属性[{name:key,value:value},...]
                attrsList: attrs,
                //属性{key1:value1,key2:value2}
                attrsMap: makeAttrsMap(attrs),//json格式转换
                parent: currentParent,
                children: []
            }
            //解析指令
            //tofix
            //后期修改为统一指令问题
            processFor(element)
            //有问题待修改
            hooks.template2Vnode.forEach(function (item) {
                item(element);
            });
            processIf(element)
            processKey(element)
            processAttrs(element)

            if (!root) {
                root = element
            }

            if (currentParent && !element.forbidden) {
                if (element.elseif || element.else) {
                    processIfConditions(element, currentParent)
                } else if (element.slotScope) { // scoped slot

                } else {
                    currentParent.children.push(element)
                    element.parent = currentParent
                }
            }
            //不是自闭合标签
            if (!unary) {
                currentParent = element
                stack.push(element)
            }
        },
        //标签结束
        end: function (tag) {
            const element = stack[stack.length - 1]
            const lastNode = element.children[element.children.length - 1]
            //删除最后一个空白文字节点
            if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
                element.children.pop()
            }
            // pop stack,比直接pop节约性能
            stack.length -= 1
            currentParent = stack[stack.length - 1]
        },
        //中间文本部分
        chars: function (text) {
            if (!text.trim()) {
                text = ' '
            }
            //解析文本节点 exp: a{{b}}c => 'a'+_s(a)+'b'
            let expression = TextParser(text, options.delimiters)
            if (expression) {
                currentParent.children.push({
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
    })
    //缓存template
    //解析vnode为render函数
    return (cache[template] = codeGen(root))
}

function processFor(el) {
    let exp
    //获取属性值
    if ((exp = getAndRemoveAttr(el, 'm-for'))) {
        //获取数组
        //(key ,index) in arr
        //[0] (key ,index) in arr,[1] (key ,index),[2] arr  
        const inMatch = exp.match(forAliasRE)
        if (!inMatch) {
            warn(`Invalid v-for expression: ${exp}`)
            return
        }
        el.for = inMatch[2].trim()
        const alias = inMatch[1].trim()
        //分解 (value,key ,index)
        //alias  value
        //iterator1 key
        //iterator2 index
        const iteratorMatch = alias.match(forIteratorRE)
        if (iteratorMatch) {
            el.alias = iteratorMatch[1].trim();
            el.iterator1 = iteratorMatch[2].trim()
            if (iteratorMatch[3]) {
                el.iterator2 = iteratorMatch[3].trim()
            }
        } else {
            el.alias = alias
        }
    }
}

function processIf(el) {
    //同上m-for
    const exp = getAndRemoveAttr(el, 'm-if')
    if (exp) {
        el.if = exp
        addIfCondition(el, {
            exp: exp,
            block: el
        })
    } else {
        if (getAndRemoveAttr(el, 'm-else') != null) {
            el.else = true
        }
        const elseif = getAndRemoveAttr(el, 'm-else-if')
        if (elseif) {
            el.elseif = elseif
        }
    }
}

function processKey(el) {
    // TODO key 优化处理
}

function processAttrs(el) {
    const list = el.attrsList
    let i, l, name, rawName, value, arg, modifiers, isProp
    for (i = 0, l = list.length; i < l; i++) {
        name = rawName = list[i].name
        value = list[i].value
        if (dirRE.test(name)) {
            // modifiers
            modifiers = parseModifiers(name)
            if (modifiers) {
                name = name.replace(modifierRE, '')
            }
            if (bindRE.test(name)) { // v-bind
                name = name.replace(bindRE, '')
                if (modifiers) {
                    if (modifiers.prop) {
                        isProp = true
                        name = camelize(name)
                        if (name === 'innerHtml') name = 'innerHTML'
                    }
                    if (modifiers.camel) {
                        name = camelize(name)
                    }
                }
                if (isProp) {
                    addProp(el, name, value)
                } else {
                    addAttr(el, name, value)
                }
            } else if (onRE.test(name)) { // v-on
                name = name.replace(onRE, '')
                addHandler(el, name, value, modifiers)
            } else { // normal directives

            }
        } else {
            addAttr(el, name, JSON.stringify(value))
        }
    }
}

