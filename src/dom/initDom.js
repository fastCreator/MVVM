import ManyStateMachine from './stateMachine'

export function initDom(vm) {
    var opt = vm.$options,
        ss = opt.splitStart || '{',
        se = opt.splitEnd || '}',
        temp = document.scripts[opt.from].innerText;
    parse(temp, ss, se);

}

function parse(temp, ss, se) {
    var str = '', expression = '', selector = [], nowTag = '';
    var stateM = new ManyStateMachine(temp);
    stateM.load('bind', 'bindOther', { bindOther: bindOther, bindStart: bindStart, bindDoing: bindDoing, bindEnd: bindEnd });
    stateM.load('tag', 'tagOther', { tagOther: tagOther, tagStart: tagStart, tagDoing: tagDoing, tagPush: tagPush, tagPop: tagPop });
    stateM.loadHandle(handle);
    stateM.start();
    console.log(str);

    function handle(states, temp, item, i) {
        var count = 0;
        var bindState = states.bind, tagState = states.tag;
        if (bindState == 'bindOther') {
            str += item;
        } else if (bindState == 'bindDoing') {
            expression += item
        } else if (bindState == 'bindEnd') {
            //console.log(expression);
            expression = '';
        }


        if (tagState == 'tagOther') {

        } else if (tagState == 'tagStart') {
            nowTag = '';
        } else if (tagState == 'tagDoing') {
            nowTag += item;
        } else if (tagState == 'tagPush') {
            selector.push(nowTag);
            console.log('push:' + nowTag)
        } else if (tagState == 'tagPop') {
            console.log('pop:' + selector.pop());
        }
        return i + count;
    }

    //绑定
    function bindOther(temp, item, i) {
        if (temp[i + 1] == ss && temp[i + 2] == ss) {
            return 'bindStart';
        }
    }

    function bindStart(temp, item, i) {
        if (item == ss && temp[i - 1] == ss) {
            return 'bindDoing';
        }
    }

    function bindDoing(temp, item, i) {
        if (temp[i + 1] == se && temp[i + 2] == se) {
            return 'bindEnd';
        }
    }

    function bindEnd(temp, item, i) {
        if (item == se && temp[i - 1] == se) {
            return 'bindOther';
        }
        if (temp[i + 1] == ss && temp[i + 2] == ss) {
            return 'bindStart';
        }
    }

    //标签
    function tagOther(temp, item, i) {
        if (temp[i + 1] == '<') {
            return 'tagStart'
        }
    }

    function tagStart(temp, item, i) {
        if (temp[i + 1] == '/') {
            return 'tagPop';
        }
        return 'tagDoing';
    }

    function tagDoing(temp, item, i) {
        if (temp[i + 1] == '>') {
            return 'tagPush';
        }
    }

    function tagPush(temp, item, i) {
        return 'tagOther'
    }

    function tagPop(temp, item, i) {
        return 'tagOther'
    }
}
//指令
