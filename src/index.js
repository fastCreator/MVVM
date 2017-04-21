import { initStatic } from './initStatic'
import { initMixin } from './initMixin'
import { initBody } from './initBody'
 import { bind} from './utils'
function MVVM(options) { 
    this._init(options);  
}

initMixin(MVVM);
// initBody(MVVM);
// bind(options.to);
// initStatic(MVVM);

window.MVVM = MVVM; 