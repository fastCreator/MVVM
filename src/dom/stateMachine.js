export default class ManyStateMachine {
    constructor(temp) {
        this.temp = temp || '';//解析模板 
        this.i = 0;//模板读取位置 
        this.stateMachine = []; //记录多状态 
    }
    _run() {
        for (var j = 0; j < this.stateMachine.length; j++) {
            let item = this.stateMachine[j],
                count = item.cb[item.currentState].call(this, this.temp, this.temp[this.i], this.i, item.next.bind(item));
            if (count != undefined) this.i = count;
        }
        if (++this.i < this.temp.length) this._run();
    }

    start(temp) {
        this.temp = temp || this.temp;
        this.i = 0;
        if (this.i < this.temp.length) this._run();
    }

    load(methods) {
        this.stateMachine.push({
            currentState: 0,
            next: function () {
                this.currentState = ++this.currentState % methods.length;
            },
            cb: methods
        });
    }

}





