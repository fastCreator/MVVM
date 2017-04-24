import ManyStateMachine from './stateMachine'

export function initDom(vm) {
    var opt = vm.$options,
        ss = opt.splitStart || '{',
        se = opt.splitEnd || '}',
        temp = document.scripts[opt.from].innerText;
    parse(temp, ss, se);

}

function parse(temp, ss, se) {
    var str = '', expression = '';
    var stateM = new ManyStateMachine(temp);
    stateM.load([bindNormal, bindStart, bindEnd]);
    stateM.load([tempNormal, tempStart, tempEnd]);
    stateM.start();

    //绑定
    function bindNormal(temp, item, i, next) {
        if (item == ss && temp[i + 1] == ss) {
            next();
            return i + 1;
        }
        str += item;
    }

    function bindStart(temp, item, i, next) {
        if (item == se && temp[i + 1] == se) {
            next();
            return i + 1;
        }
        expression += item;
    }

    function bindEnd(temp, item, i, next) {
        console.log(expression);
        expression = '';
        str += item;
        next();
    }
    //标签
    function tempNormal(temp, item, i, next) {

    }

    function tempStart(temp, item, i, next) {

    }

    function tempEnd(temp, item, i, next) {

    }
}

//多状态机
//
//bindStart bindEnd
//tagStart tagEnd
//directiveStart tagEnd

//绑定，标签，指令
