import Prototype from '.classes/Prototype'
import Util from '.classes/Util'

let uid = 0;

class MVVM extends mix(initLifecycle, initEvents) {
    constructor(options) {
        this.$options = options;
        this._uid = uid++; 
        initLifecycle(vm)
        initEvents(vm)
        initRender(vm)
        callHook(vm, 'beforeCreate')
        initInjections(vm) // resolve injections before data/props
        initState(vm)
        initProvide(vm) // resolve provide after data/props
        callHook(vm, 'created')
    }

    static startTag = MVVM.startTag || '{{';
    static endTag = MVVM.endTag || '}}';
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