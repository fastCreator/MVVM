import { isObject } from '../utils'
export class Observer {
    constructor(value) {
        this.value = value;
        //this.dep = new Dep();
        this.vmCount = 0;//$date的属性个数
    }
    //只有当值为对象时，为每个属性添加getter/setters
    walk(obj) {
        const keys = Object.keys(obj)
        for (let i = 0, l = keys.length; i < l; i++) {
            defineReactive(obj, keys[i], obj[keys[i]])
        }
    }
    //只有当值为数组时，为每个属性添加getter/setters
    observeArray(items) {
        for (let i = 0, l = items.length; i < l; i++) {
            observe(items[i])
        }
    }
}

export function defineReactive(obj, key, val, customSetter) {
    //new dep = new Dep();
    const property = Object.getOwnPropertyDescriptor(obj, key)
    if (property && property.configurable === false) {
        return
    }
    const getter = property && property.get
    const setter = property && property.set

    let childOb = observe(val)
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter() {
            const value = getter ? getter.call(obj) : val
            //当有依赖关系时，收集依赖
            // if (Dep.target) {
            //     dep.depend()
            //     if (childOb) {
            //         childOb.dep.depend()
            //     }
            //     if (Array.isArray(value)) {
            //         dependArray(value)
            //     }
            // }
            return value
        },
        set: function reactiveSetter(newVal) {
            const value = getter ? getter.call(obj) : val
            //查看值是否变化
            if (newVal === value || (newVal !== newVal && value !== value)) {
                return
            }
            if (setter) {
                setter.call(obj, newVal)
            } else {
                val = newVal
            }
            childOb = observe(newVal)
            //触发更新
            //dep.notify()
        }
    })
}

export function observe(value, asRootData) {
    if (!isObject(value)) {
        return
    }
    let ob
    //已经存在observer,不再赋值
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__
    } else {
        ob = new Observer(value)
    }
    if (asRootData && ob) {
        ob.vmCount++
    }
    return ob
}