//import ManyStateMachine from './stateMachine'

// export function initDom(vm) {
//     var opt = vm.$options,
//         ss = opt.splitStart || '{',
//         se = opt.splitEnd || '}',
//         temp = document.scripts[opt.from].innerText;
//     parse(temp, ss, se);

// }

// function parse(temp, ss, se) {
//     var str = '', expression = '', selector = [], nowTag = '';
//     var stateM = new ManyStateMachine(temp);
//     var allState = stateM.allState;
//     stateM.load('bind', 'bindOther', { bindOther: bindOther, bindStart: bindStart, bindDoing: bindDoing, bindEnd: bindEnd });
//     stateM.load('tag', 'tagOther', { tagOther: tagOther, tagStart: tagStart, tagDoing: tagDoing, tagPush: tagPush, tagPop: tagPop });
//     stateM.load('directive', 'directiveOther', { directiveOther: directiveOther });
//     stateM.loadHandle(handle);
//     stateM.start();
//     console.log(str);

//     function handle(states, temp, item, i) {
//         var count = 0;
//         var bindState = states.bind, tagState = states.tag;
//         if (bindState == 'bindOther') {
//             str += item;
//         } else if (bindState == 'bindDoing') {
//             expression += item
//         } else if (bindState == 'bindEnd') {
//             //console.log(expression);
//             expression = '';
//         }


//         if (tagState == 'tagOther') {

//         } else if (tagState == 'tagStart') {
//             nowTag = '';
//         } else if (tagState == 'tagDoing') {
//             nowTag += item;
//         } else if (tagState == 'tagPush') {
//             selector.push(nowTag);
//             console.log('push:' + nowTag)
//         } else if (tagState == 'tagPop') {
//             console.log('pop:' + selector.pop());
//         }
//         return i + count;
//     }

//     //绑定
//     function bindOther(temp, item, i) {
//         if (temp[i + 1] == ss && temp[i + 2] == ss) {
//             return 'bindStart';
//         }
//     }

//     function bindStart(temp, item, i) {
//         if (item == ss && temp[i - 1] == ss) {
//             return 'bindDoing';
//         }
//     }

//     function bindDoing(temp, item, i) {
//         if (temp[i + 1] == se && temp[i + 2] == se) {
//             return 'bindEnd';
//         }
//     }

//     function bindEnd(temp, item, i) {
//         if (item == se && temp[i - 1] == se) {
//             return 'bindOther';
//         }
//         if (temp[i + 1] == ss && temp[i + 2] == ss) {
//             return 'bindStart';
//         }
//     }

//     //标签
//     function tagOther(temp, item, i) {
//         if (temp[i + 1] == '<') {
//             return 'tagStart'
//         }
//     }

//     function tagStart(temp, item, i) {
//         if (temp[i + 1] == '/') {
//             return 'tagPop';
//         }
//         return 'tagDoing';
//     }

//     function tagDoing(temp, item, i) {
//         if (temp[i + 1] == '>') {
//             return 'tagPush';
//         }
//     }

//     function tagPush(temp, item, i) {
//         return 'tagOther'
//     }

//     function tagPop(temp, item, i) {
//         return 'tagOther'
//     }
//     //指令 
//     function directiveOther(temp, item, i) {
//         if (allState.tag == 'tagDoing') {
//             if (item == '' && temp[i + 1] == 'm' && temp[i + 2] == '-') {
//                 return 'directiveStart';
//             }
//         }
//     }

//     function directiveStart(temp, item, i) {
//         if (item == '-' && temp[i + 1] == 'f' && temp[i + 2] == 'o'&& temp[i + 2] == 'r') {
//             return 'directiveStart';
//         }
//     }

//     function directiveFor() {

//     }

//     function directiveForDoing() {

//     }

//     function directiveEnd(temp, item, i) {

//     }
// }

import {parseHTML} from './html-parser'

export function initDom(vm) {
    var opt = vm.$options,
        ss = opt.splitStart || '{',
        se = opt.splitEnd || '}',
        temp = document.scripts[opt.from].innerText;

    var results = "";

    parseHTML("<p id=test>hello <i>world", {
        start: function (tag, attrs, unary) {
            results += "<" + tag;

            for (var i = 0; i < attrs.length; i++)
                results += " ";

            results += (unary ? "/" : "") + ">";
        },
        end: function (tag) {
            results += "</" + tag + ">";
        },
        chars: function (text) {
            results += text;
        },
        comment: function (text) {
            results += "<!--" + text + "-->";
        }
    });
    
    console.log(results); 
}
