import { observe } from './observer/index';
export function initMixin(MVVM) {
    MVVM.prototype._init = function (opt) {
        this.$options = opt;
        initState(this);
    }
}

function initState(vm) {
    vm._watchers = [];
    const opts = vm.$options
    if (opts.data) { 
        initData(vm)
    }
}

function initData(vm) {
    data = vm.data;
    observe(data, true);
}