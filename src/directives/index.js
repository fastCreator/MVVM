import { isFunction } from '../utils'
import directiveFor from './for'

export const hooks = {
    template2Vnode: [],
    vnode2render: [],
};
export default class Directive {
    constructor() {
        //初始化默认指令
        //Directive.directive('m-for', directiveFor);
    }

    static directive(name, callhook = {}) {
        names.push(name);
        object.keys().forEach(function (name, ...arg) {
            let cb = callhook[name];
            if (cb && isFunction(cb)) {
                hooks[name].push(function (enterName) {
                    if (name === enterName) {
                        cb.apply(this, arg);
                    }
                })
            }
        });
    }
}
