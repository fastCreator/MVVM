export function initBody(opt) {
    var body = document.scripts[opt.from].innerText
    var str = '';
    var ss = opt.splitStart || '{', se = opt.splitEnd || '}';
    console.log(stateMachine(body, ss, se, opt.data));
}

function stateMachine(body, ss, se, data) {
    var str = '', i = 0, expression = '', len = body.length, item;
    none();
    //初始状态
    function none() {
        if (!next()) return false;
        if (item == ss) {
            oneS()
        } else {
            str += item;
            none();
        }
    }
    //有一个分隔符
    function oneS() {
        if (!next()) return false;
        if (item == ss) {
            towS()
        } else {
            none();
        }
    }
    //有两个分隔符
    function towS() {
        if (!next()) return false;
        if (item == se) {
            oneE();
        } else {
            expression += item;
            towS();
        }
    }



    //有一个分隔符结束
    function oneE() {
        if (!next()) return false;
        if (item == se) {
            towE();
        } else {
            expression += item;
            oneE();
        }
    }
    //有两个分隔符结束
    function towE() {
        if (!next()) return false;
        str += data[expression]
        str += item; 
        expression = '';
        none();
    }

    function next() {
        if (i >= len) return false;
        item = body[i];
        i++;
        return true;
    }
    return str;
}
