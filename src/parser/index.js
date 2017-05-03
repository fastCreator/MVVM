import HTMLParser from './html-parser'
import TextParser from './text-parser'
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

const cache = {}

export function compileToFunctions(template, vm) {
    let root
    let currentParent
    let options = vm.$options
    let stack = []

    if (cache[template]) {
        return cache[template]
    }

    HTMLParser(template, {
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
    return (cache[template] = codeGen(root))
}

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

function processIf(el) {
    const exp = getAndRemoveAttr(el, 'v-if')
    if (exp) {
        el.if = exp
        addIfCondition(el, {
            exp: exp,
            block: el
        })
    } else {
        if (getAndRemoveAttr(el, 'v-else') != null) {
            el.else = true
        }
        const elseif = getAndRemoveAttr(el, 'v-else-if')
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

