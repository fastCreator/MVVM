import { domTostr, strTodom, isDom } from './utils'
export function initStatic(MVVM) {
    MVVM.domTostr = domTostr;
    MVVM.strTodom = strTodom;
    MVVM.isDom = isDom;
    //触发set的数组的方法
}

