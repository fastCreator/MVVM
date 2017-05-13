import Watcher from './watcher'

import {
    warn,
    nextTick
} from '../utils'

export const MAX_UPDATE_COUNT = 100

const queue = []
const activatedChildren = []
let has = {}
let circular = {}
let waiting = false
let flushing = false
let index = 0

//初始化状态
function resetSchedulerState() {
    queue.length = activatedChildren.length = 0
    has = {}
    waiting = flushing = false
}

//刷新异步更新队列
function flushSchedulerQueue() {
    flushing = true
    let watcher, id
    //异步队列保证以下几点
    //1,先更新父，在更新子
    //2,摧毁时，不再更新
    //3,先执行user watchers 再执行render watcher 
    queue.sort((a, b) => a.id - b.id)

    //不要缓存队列长度，因为不停被加入
    for (index = 0; index < queue.length; index++) {
        watcher = queue[index]
        id = watcher.id
        has[id] = null
        watcher.run();
    }

    // 在重置状态之前保留队列的副本
    const activatedQueue = activatedChildren.slice()
    const updatedQueue = queue.slice()

    resetSchedulerState()

    // 调用组件更新和激活钩子
    callActivatedHooks(activatedQueue)
    callUpdateHooks(updatedQueue)

}

function callUpdateHooks(queue) {
    let i = queue.length
    while (i--) {
        const watcher = queue[i]
        const vm = watcher.vm
        if (vm._watcher === watcher && vm._isMounted) {
            callHook(vm, 'updated')
        }
    }
}

function callActivatedHooks(queue) {
    for (let i = 0; i < queue.length; i++) {
        queue[i]._inactive = true
        activateChildComponent(queue[i], true /* true */)
    }
}

//添加到异步更新队列
export function queueWatcher(watcher) { 
    const id = watcher.id
    if (has[id] == null) {
        has[id] = true
        if (!flushing) {
            queue.push(watcher)
        } else {
            // watcher去重
            // 如果已经超过它的ID，它将立即运行下一个
            let i = queue.length - 1
            while (i >= 0 && queue[i].id > watcher.id) {
                i--
            }
            queue.splice(Math.max(i, index) + 1, 0, watcher)
        }
        // 排入队列
        if (!waiting) {
            waiting = true
            nextTick(flushSchedulerQueue)
        }
    }
}
