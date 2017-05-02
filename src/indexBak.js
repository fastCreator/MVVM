import { initStatic } from './initStatic'
import { initPrototype } from './initPrototype'
import { initInstance } from './initInstance' 
import { bind } from './utils'
function MVVM(options) {
    this._init(options);
}

initPrototype(MVVM);
initInstance(MVVM);  
initStatic(MVVM);

window.MVVM = MVVM; 