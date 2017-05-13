import { isObject, hasOwn, def, hasProto } from '../utils'
import { arrayMethods } from './array'
import Dep from './dep'
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)
export class Observer {
    constructor(value) {
        this.value = value;
        this.dep = new Dep();
        this.vmCount = 0;//$date的属性个数
        def(value, '__ob__', this);
        if (Array.isArray(value)) {
            //判断是否能访问原型链上属性for兼容
            const augment = hasProto
                ? protoAugment
                : copyAugment
            //覆盖数组原生方法，触发notify
            augment(value, arrayMethods, arrayKeys)
            this.observeArray(value)
        } else {
            this.walk(value)
        }
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
    const dep = new Dep();
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
            if (Dep.target) {
                //把自己添加到依赖
                dep.depend()
                if (childOb) {
                    //访问子的时候会冒泡去访问父
                    //父会把子添加到__ob__，这个属性只是看看而已，没什么实际意义
                    //会添加data属性下的所有对象离散集
                    childOb.dep.depend()
                }
                if (Array.isArray(value)) {
                    dependArray(value)
                }
            }
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
            dep.notify()
        }
    })
}
//导出观察方法
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

function protoAugment(target, src) {
    target.__proto__ = src
}

function copyAugment(target, src, keys) {
    for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i]
        def(target, key, src[key])
    }
}
//为数组添加依赖
function dependArray(value) {
    for (let e, i = 0, l = value.length; i < l; i++) {
        e = value[i]
        e && e.__ob__ && e.__ob__.dep.depend()
        if (Array.isArray(e)) {
            dependArray(e)
        }
    }
}