import Watcher from './observer/watcher';

export function initPrototype(MVVM) {
    initWatch(MVVM);
}

function initWatch(MVVM) {
    MVVM.prototype.$watch = function (expOrFn, cb, options) {
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
}

function callHook(vm, hook) {
    const handlers = vm.$options[hook]
    if (handlers) {
        handlers.call(vm)
    }
}