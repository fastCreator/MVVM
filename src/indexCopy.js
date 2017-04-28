import Prototype from '.classes/Prototype'
import Util from '.classes/Util'

class MVVM extends mix(Prototype, Util) {

}

//继承多个父类
function mix(...mixins) {
    class Mix { }
    for (let mixin of mixins) {
        copyProperties(Mix, mixin);
        copyProperties(Mix.prototype, mixin.prototype);
    }
    return Mix;
}

//init.js
// initLifecycle(vm)
// initEvents(vm)
// initRender(vm)
// callHook(vm, 'beforeCreate')
// initInjections(vm) // resolve injections before data/props
// initState(vm)
// initProvide(vm) // resolve provide after data/props
// callHook(vm, 'created')