import { isFunction } from '../utils'
import { directiveFor } from './for'
import { directiveIf } from './if'
import { directiveOn } from './on'
import { directiveModel } from './model'

export const hooks = {

};

export const directive = {
    install: function (MVVM) {
        MVVM.directive = function (name, callhook = {}) {
            var hasDir = false;
            hooks[name] = callhook;
        } 
        MVVM.directive('for', directiveFor);
        MVVM.directive('if', directiveIf);
        MVVM.directive('on', directiveOn);
        MVVM.directive('model', directiveModel);
    }
} 