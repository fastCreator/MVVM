import { observe } from './observer'
import Watcher from './observer/watcher'
import { query, warn, idToTemplate, toString, resolveAsset } from './utils'
import { initData, initComputed, initMethods, initWatch } from './instance/initState'
import { compileToFunctions } from './parser'
import { patch, h, VNode } from './vnode'
let uid = 0;

global.MVVM = class {
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
        let options = this.$options
        this.$el = el = el && query(el);
        if (!options.render) {
            //获取template
            let template = options.template
            if (template) {
                if (typeof template === 'string') {
                    if (template[0] === '#') {
                        template = idToTemplate(template)
                    }
                } else if (template.nodeType) {
                    template = template.innerHTML
                }
            } else if (el) {
                template = getOuterHTML(el)
            }
            //生成render函数
            if (template) {
                console.log(template)
                const render = compileToFunctions(template, this)
                console.log(render)
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
            vnode = render.call(this);
        } catch (e) {
            warn(`render Error : ${e}`)
        }
        console.log(vnode)
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
