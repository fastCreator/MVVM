/* @flow */

import Watcher from './watcher'
import { remove } from '../utils'

let uid = 0

//dep是观察者，他知道有多少computed依赖于他
//依赖对象在subs中
export default class Dep { 
    constructor() {
        this.id = uid++
        this.subs = []
    }
    //添加watcher
    addSub(sub) {
        this.subs.push(sub)
    }
    //移除watcher
    removeSub(sub) {
        remove(this.subs, sub)
    }
    //computed获取值的时候收集依赖
    depend() {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    }
    //设置值的时候，触发异步更新队列
    notify() {
        const subs = this.subs.slice();
        for (let i = 0, l = subs.length; i < l; i++) {
            subs[i].update()
        }
    }
}

//当获取computed时候Dep.target(全局的,Dep静态属性)赋值，以此来收集依赖关系
Dep.target = null
const targetStack = []

export function pushTarget(_target) {
    if (Dep.target) targetStack.push(Dep.target)
    Dep.target = _target
}

export function popTarget() {
    Dep.target = targetStack.pop()
}
