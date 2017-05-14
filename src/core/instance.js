import { observe } from './observer';
import Dep from './observer/dep';
import Watcher from './observer/watcher';
import { noop, warn, isPlainObject, isFunction, bind } from './utils';

const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
}

//初始化data属性
export function initData(vm, data) {
    if (isFunction(data)) {
        data = data()
    }
    //监听data get(收集依赖)/set(触发更新)
    observe(data, true);
    vm.$data = data;
    const keys = Object.keys(data)
    let i = keys.length;
    //代理data到vm
    while (i--) {
        proxy(vm, '$data', keys[i])
    }
}

//初始化计算属性
const computedWatcherOptions = { lazy: true }

export function initComputed(vm, computed) {
    //存放计算属性，user watch,render watch 
    const watchers = vm._computedWatchers = Object.create(null)
    for (const key in computed) {
        const userDef = computed[key]
        let getter = typeof userDef === 'function' ? userDef : userDef.get
        watchers[key] = new Watcher(vm, getter, noop, computedWatcherOptions)
        if (!(key in vm)) {
            //将计算属性放入vm(get/set)
            defineComputed(vm, key, userDef)
        } else {
            warn(`计算属性 "${key}" 已经被定义了哦`)
        }
    }
}
//初始方法
export function initMethods(vm, methods) {
    //遍历到原型链属性
    for (const key in methods) {
        vm[key] = methods[key] == null ? noop : bind(methods[key], vm)
    }
}
//初始化监听
export function initWatch(vm, watch) {
    for (const key in watch) {
        const handler = watch[key];
        if (Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i++) {
                createWatcher(vm, key, handler[i])
            }
        } else {
            createWatcher(vm, key, handler)
        }
    }
}
//创建单个watcher
function createWatcher(vm, key, handler) {
    let options
    //是个对象时，主要为了写deep属性
    if (isPlainObject(handler)) {
        options = handler
        handler = handler.handler
    }
    //直接写方法名时 
    if (typeof handler === 'string') {
        handler = vm[handler]
    }
    vm.$watch(key, handler, options)
}
//定义单个计算属性
function defineComputed(target, key, userDef) {
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
    //在VM上绑定computed
    Object.defineProperty(target, key, sharedPropertyDefinition)
}
//创建计算属性默认get方法
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

//代理 在vm上直接访问$date上面的data
function proxy(target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter(val) {
        this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

