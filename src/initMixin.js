import { observe } from './observer/index';
import { noop, warn } from './utils';

const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
}

export function initMixin(MVVM) {
    MVVM.prototype._init = function (opt) {
        this.$options = opt;
        initState(this);
        initComputed(this);
    }
}

function initState(vm) {
    vm._watchers = [];
    initData(vm)
    bind(vm);
}

const computedWatcherOptions = { lazy: true }
function initComputed(vm) {
    //const watchers = vm._computedWatchers = Object.create(null)
    var computed = vm.$options.computed;
    for (const key in computed) {
        const userDef = computed[key]
        let getter = typeof userDef === 'function' ? userDef : userDef.get

        //watchers[key] = new Watcher(vm, getter, noop, computedWatcherOptions)
        if (!(key in vm)) {
            defineComputed(vm, key, userDef)
        } else {
            warn(`计算属性 "${key}" 已经被定义了哦`)
        }
    }

}

export function defineComputed(target, key, userDef) {
    if (typeof userDef === 'function') {
        sharedPropertyDefinition.get = createComputedGetter(key)
        sharedPropertyDefinition.set = noop
    } else {
        sharedPropertyDefinition.get = userDef.get
            ? userDef.cache !== false
                ? createComputedGetter(key)
                : userDef.get
            : noop
        sharedPropertyDefinition.set = userDef.set
            ? userDef.set
            : noop
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

function createComputedGetter(key) {
    return function computedGetter() {
        const watcher = this._computedWatchers && this._computedWatchers[key]
        if (watcher) {
            if (watcher.dirty) {
                watcher.evaluate()
            }
            if (Dep.target) {
                watcher.depend()
            }
            return watcher.value
        }
    }
}

function initData(vm) {
    var data = vm.$options.data;
    if (data) {
        typeof data === 'object' ? data = vm.$data = JSON.parse(JSON.stringify(data)) : warn('data should object')
    } else {
        return;
    }
    const keys = Object.keys(data)
    let i = keys.length;
    //代理data到vm
    while (i--) {
        proxy(vm, '$data', keys[i])
    }
    //观察data
    observe(data, true);
}

function bind(vm) {
    //Object.assign(vm, vm.$options.data);
    for (var i in vm.$options.data) {
        vm[i] = vm.$options.data[i]
    }
}
//计算属性get
function createComputedGetter(key) {
    return function computedGetter() {
        const watcher = this._computedWatchers && this._computedWatchers[key]
        if (watcher) {
            if (watcher.dirty) {
                watcher.evaluate()
            }
            if (Dep.target) {
                watcher.depend()
            }
            return watcher.value
        }
    }
}
//data get/set
export function proxy(target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter(val) {
        this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

