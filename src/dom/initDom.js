import ManyStateMachine from './stateMachine'

export function initDom(vm) {
    var opt = vm.$options,
        ss = opt.splitStart || '{',
        se = opt.splitEnd || '}',
        temp = document.scripts[opt.from].innerText;
    parse(temp, ss, se);

}
// {
//     bind:'title',
//     selector:[]
// }
function parse(temp, ss, se) {
    var str = '', expression = '', selector = [], nowTag = '';
    var stateM = new ManyStateMachine(temp);
    stateM.load('bind', 'bindNormal', { bindNormal: bindNormal, bindStart: bindStart, bindEnd: bindEnd });
    stateM.load('tag', 'tempSNormal', { tempSNormal: tempSNormal, tempSStart: tempSStart, tagPush: tagPush, tagPop: tagPop });
    stateM.start();
    console.log(str)
    //绑定
    function bindNormal(temp, item, i, to) {
        if (item == ss && temp[i + 1] == ss) {
            to('bindStart');
            return i + 1;
        }
        str += item;
    }

    function bindStart(temp, item, i, to) {
        if (item == se && temp[i + 1] == se) {
            to('bindEnd');
            return i + 1;
        }
        expression += item;
    }

    function bindEnd(temp, item, i, to) {
        expression = '';
        str += item;
        to('bindNormal')
    }
    //标签
    function tempSNormal(temp, item, i, to) {
        if (item == '<') {
            to('tempSStart')
        }
    }

    function tempSStart(temp, item, i, to) {
        if (item == '>') {
            to('tagPush');
        } else if (item == '/') {
            to('tagPop');
        } else {
            nowTag += item;
        }
    }

    function tagPush(temp, item, i, to) {
        selector.push(nowTag);
        console.log('push:' + nowTag);
        nowTag = '';
        to('tempSNormal');
    }

    function tagPop(temp, item, i, to) {
        console.log('pop:' + selector.pop());
        nowTag = '';
        to('tempSNormal');
    }
}

//多状态机
//
//bindStart bindEnd
//tagStart tagEnd
//directiveStart tagEnd

//绑定，标签，指令
