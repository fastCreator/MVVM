//import Prototype from '.classes/Prototype'
//import Util from '.classes/Util'
import { initData, initComputed, initMethods, initWatch } from './instance/initState'

let uid = 0;

export class MVVM {
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
        if (options.initWatch) {
            initWatch(this, options.watch)
        }
        if (options.methods) {
            initMethods(this, options.methods)
        }
        callHook(this, 'created');
        this.$mount(options.el);
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
