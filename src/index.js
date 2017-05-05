import { observe } from './observer'
import Watcher from './observer/watcher'
import { query, warn, idToTemplate, toString, resolveAsset } from './utils'
import { initData, initComputed, initMethods, initWatch } from './instance/initState'
import { compileToFunctions } from './parser'
import { patch, h, VNode } from './vnode'
import Directive from './directives'

let uid = 0;

global.MVVM = class{
    constructor(options) {
        this.$options = options;
        this._uid = uid++;
        callHook(this, 'beforeCreate')
        if (options.data) {
            initData(this, options.data)
        }
        if (options.computed) {
            initComputed(this, options.computed)
        }
        if (options.watch) {
            initWatch(this, options.watch)
        }
        if (options.methods) {
            initMethods(this, options.methods)
        }
        callHook(this, 'created');
        this.$mount(options.el);
    }

    $mount(el) {
        let options = this.$options;
        //渲染入口
        this.$el = el = el && query(el);
        //判断是否用户自定义render h函数,则不需要template
        if (!options.render) {
            //获取template
            let template = options.template
            if (template) {
                if (typeof template === 'string') {
                    //获取script的template模板
                    if (template[0] === '#') {
                        template = idToTemplate(template)
                    }
                    //获取DOM类型tempalte
                } else if (template.nodeType) {
                    template = template.innerHTML
                }
                //直接从入口处获取template
            } else if (el) {
                template = getOuterHTML(el)
            }
            console.log(template)
            //生成render函数
            if (template) {
                //生成render函数
                const render = compileToFunctions(template, this)
                options.render = render
            }
        }

        callHook(this, 'beforeMount')

        if (!options._isComponent) {
            //更新dom 
            this._update(this._render())
        }

        if (!this._vnode) {
            this._isMounted = true
            callHook(this, 'mounted')
        }

        return this
    }

    $watch(expOrFn, cb, options) {
        const vm = this
        options = options || {}
        options.user = true
        const watcher = new Watcher(vm, expOrFn, cb, options)
        if (options.immediate) {
            cb.call(vm, watcher.value)
        }
        return function unwatchFn() {
            watcher.teardown()
        }
    }

    $forceUpdate() {
        this._update(this._render())
    }

    $set() { }
    $delete() { }

    _patch = patch
    _s = toString

    _render() {
        let render = this.$options.render
        let vnode
        try {
            //自动解析的template不需要h,用户自定义的函数需要h
            vnode = render.call(this, h);
        } catch (e) {
            warn(`render Error : ${e}`)
        }
        return vnode
    }

    _update(vnode) {
        if (this._isMounted) {
            callHook(this, 'beforeUpdate')
        }
        const prevVnode = this._vnode || this.$options._vnode
        this._vnode = vnode

        if (!prevVnode) {
            console.log(vnode)
            this.$el = this._patch(this.$el, vnode)
        } else {
            this.$el = this._patch(prevVnode, vnode)
        }
        if (this._isMounted) {
            callHook(this, 'updated')
        }
    }
    //渲染template和component
    _h(sel, data, children) {
        data = data || {}

        if (Array.isArray(data)) {
            children = data
            data = {}
        }

        data.hook = data.hook || {}

        if (this.$options.destroy) {
            data.hook.destroy = bind(this.$options.destroy, this)
        }

        if (Array.isArray(children)) {
            let faltChildren = []

            children.forEach((item) => {
                if (Array.isArray(item)) {
                    faltChildren = faltChildren.concat(item)
                } else {
                    faltChildren.push(item)
                }
            })

            children = faltChildren.length ? faltChildren : children
        }

        if (typeof sel == 'string') {
            let Ctor = resolveAsset(this.$options, 'components', sel)
            if (Ctor) {
                return this._createComponent(Ctor, data, children, sel)
            }
        }

        return h(sel, data, children)
    }
    //渲染for时,返回多个render
    _l(val, render) {
        let ret, i, l, keys, key
        if (Array.isArray(val) || typeof val === 'string') {
            ret = new Array(val.length)
            for (i = 0, l = val.length; i < l; i++) {
                ret[i] = render(val[i], i)
            }
        } else if (typeof val === 'number') {
            ret = new Array(val)
            for (i = 0; i < val; i++) {
                ret[i] = render(i + 1, i)
            }
        } else if (isObject(val)) {
            keys = Object.keys(val)
            ret = new Array(keys.length)
            for (i = 0, l = keys.length; i < l; i++) {
                key = keys[i]
                ret[i] = render(val[key], key, i)
            }
        }
        return ret
    }

}


//继承多个父类
function mix(...mixins) {
    class Mix { }
    for (let mixin of mixins) {
        copyProperties(Mix, mixin);
        copyProperties(Mix.prototype, mixin.prototype);
    }
    return Mix;
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

//生命周期钩子函数
function callHook(vm, hook) {
    const handlers = vm.$options[hook]
    if (handlers) {
        if (Array.isArray(handlers)) {
            for (let i = 0, j = handlers.length; i < j; i++) {
                try {
                    handlers[i].call(vm)
                } catch (e) {
                    handleError(e, vm, `${hook} hook`)
                }
            }
        } else {
            handlers.call(vm)
        }

    }
}


//init.js
// initLifecycle(vm)
// initEvents(vm)
// initRender(vm)
// callHook(vm, 'beforeCreate')
// initInjections(vm) // resolve injections before data/props
// initState(vm)
// initProvide(vm) // resolve provide after data/props
// callHook(vm, 'created')
