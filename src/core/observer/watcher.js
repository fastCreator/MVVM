import { queueWatcher } from './scheduler'
import Dep, { pushTarget, popTarget } from './dep'

import {
    warn,
    remove,
    isObject,
    parsePath,
    _Set as Set
} from '../utils'

let uid = 0

//一个观察者 解析执行表达式代码，收集它依赖于的dep对象
//缓存计算第一次的值，当值依赖发生改变时，变为脏数据，再次请求，更新数据
//这是user watch/render watch 中的 user watch
export default class Watcher {
    constructor(vm, expOrFn, cb, options) {
        this.vm = vm
        vm._watchers.push(this)
        if (options) {
            this.deep = !!options.deep
            this.user = !!options.user
            this.lazy = !!options.lazy
            this.sync = !!options.sync
        } else {
            this.deep = this.user = this.lazy = this.sync = false
        }
        this.cb = cb
        this.id = ++uid
        this.active = true
        this.dirty = this.lazy
        this.deps = []
        this.newDeps = []
        this.depIds = new Set()
        this.newDepIds = new Set()
        this.expression = expOrFn.toString()
        // parse expression for getter
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn
        } else {
            this.getter = parsePath(expOrFn) 
            if (!this.getter) {
                this.getter = function () { }
            }
        }
        //判断当是user watch收集依赖
        this.value = this.lazy
            ? undefined
            : this.get()
    }

    //computed获取值的时候调用watcher.get();
    get() { 
        pushTarget(this)
        let value
        const vm = this.vm
        if (this.user) { 
            try {
                value = this.getter.call(vm, vm) 
            } catch (e) {
                warn(`getter for watcher "${this.expression}"`)
            }
        } else { 
            value = this.getter.call(vm, vm)
        }
        //当deep设置为true的时候，来深度观察依赖对象的变动
        if (this.deep) {
            traverse(value)
        }
        popTarget()
        this.cleanupDeps()
        return value
    }

    //收集watcher依赖的dep对象
    addDep(dep) {
        const id = dep.id
        //因为访问父的时候，会判断添加子依赖，
        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id)
            this.newDeps.push(dep)
            if (!this.depIds.has(id)) {
                dep.addSub(this)
            }
        }
    }

    //清除依赖的dep对象
    cleanupDeps() {
        let i = this.deps.length
        while (i--) {
            const dep = this.deps[i]
            if (!this.newDepIds.has(dep.id)) {
                dep.removeSub(this)
            }
        }
        let tmp = this.depIds
        this.depIds = this.newDepIds
        this.newDepIds = tmp
        this.newDepIds.clear()
        tmp = this.deps
        this.deps = this.newDeps
        this.newDeps = tmp
        this.newDeps.length = 0
    }

    //当依赖改变时被调用
    update() {
        if (this.lazy) {
            this.dirty = true
        } else if (this.sync) {
            this.run()
        } else {
            queueWatcher(this)
        }
    }

    //开启加入到异步更新队列
    run() {
        if (this.active) {
            const value = this.get()
            if (
                value !== this.value ||
                //是对象或者是深度的时候需要重新赋值，因为可能突变
                isObject(value) ||
                this.deep
            ) { 
                //设置新值
                const oldValue = this.value
                this.value = value
                if (this.user) {
                    try { 
                        this.cb.call(this.vm, value, oldValue);
                    } catch (e) {
                        warn(`callback for watcher "${this.expression}"`)
                    }
                } else {
                    this.cb.call(this.vm, value, oldValue)
                }
            }
        }
    }

    //依赖发生改变以后，获取值是重新赋值的方法
    evaluate() {
        this.value = this.get()
        this.dirty = false
    }

    //把自己加入到依赖dep对象，dep对象因此知道有哪些watcher需要更新<关键>
    depend() {
        let i = this.deps.length
        while (i--) {
            this.deps[i].depend()
        }
    }

    //卸载该watcher
    teardown() {
        if (this.active) {
            //卸载vm.watcher 
            //如果vm正在被摧毁，跳过此步骤，因为这个操作消耗性能
            if (!this.vm._isBeingDestroyed) {
                remove(this.vm._watchers, this)
            }
            let i = this.deps.length
            while (i--) {
                this.deps[i].removeSub(this)
            }
            this.active = false
        }
    }
}


//遍历依赖对象的所有get方法,这样可以把每个属性设置为依赖
const seenObjects = new Set()
function traverse(val) {
    seenObjects.clear()
    _traverse(val, seenObjects)
}

function _traverse(val, seen) {
    let i, keys
    const isA = Array.isArray(val)
    if ((!isA && !isObject(val)) || !Object.isExtensible(val)) {
        return
    }
    if (val.__ob__) {
        const depId = val.__ob__.dep.id
        if (seen.has(depId)) {
            return
        }
        seen.add(depId)
    }
    if (isA) {
        i = val.length
        while (i--) _traverse(val[i], seen)
    } else {
        keys = Object.keys(val)
        i = keys.length
        while (i--) _traverse(val[keys[i]], seen)
    }
}
