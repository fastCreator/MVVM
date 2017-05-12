import { toArray } from './utils'

export const event = {
    install: function (MVVM) {
        MVVM.prototype._events = {};
        MVVM.prototype.$on = (event, fn) => {
            const vm = MVVM.prototype;
            if (Array.isArray(event)) {
                for (let i = 0, l = event.length; i < l; i++) {
                    this.$on(event[i], fn)
                }
            } else {
                (vm._events[event] || (vm._events[event] = [])).push(fn)
            }
            return vm;
        }
        MVVM.prototype.$once = (event, fn) => {
            const vm = MVVM.prototype;
            function on() {
                vm.$off(event, on)
                fn.apply(vm, arguments)
            }
            on.fn = fn
            vm.$on(event, on)
            return vm;
        }
        MVVM.prototype.$off = (event, fn) => {
            const vm = MVVM.prototype;
            if (!arguments.length) {
                vm._events = Object.create(null)
                return vm
            }
            if (Array.isArray(event)) {
                for (let i = 0, l = event.length; i < l; i++) {
                    this.$off(event[i], fn)
                }
                return vm
            }
            const cbs = vm._events[event]
            if (!cbs) {
                return vm
            }
            if (arguments.length === 1) {
                vm._events[event] = null
                return vm
            }
            let cb
            let i = cbs.length
            while (i--) {
                cb = cbs[i]
                if (cb === fn || cb.fn === fn) {
                    cbs.splice(i, 1)
                    break
                }
            }
            return vm
        }
        MVVM.prototype.$emit = (event) => {
            const vm = MVVM.prototype;
            let cbs = vm._events[event]
            if (cbs) {
                cbs = cbs.length > 1 ? toArray(cbs) : cbs
                const args = toArray(arguments, 1)
                for (let i = 0, l = cbs.length; i < l; i++) {
                    cbs[i].apply(vm, args)
                }
            }
            return vm
        }
    }
}



