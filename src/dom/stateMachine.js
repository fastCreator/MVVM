export default class ManyStateMachine {
    constructor(temp) {
        this.temp = temp || '';//解析模板 
        this.i = 0;//模板读取位置 
        this.allFuc = {}; //记录所有函数
        this.allState = {};//记录所有状态
    }
    _run() {
        for (var taskName in this.allFuc) {
            let myfucs = this.allFuc[taskName], myState = this.allState[taskName],
                count = myfucs[myState].call(this, this.temp, this.temp[this.i], this.i, this.to(taskName));
            if (count != undefined) this.i = count;
        }
        if (++this.i < this.temp.length) this._run();
    }

    start(temp) {
        this.temp = temp || this.temp;
        this.i = 0;
        if (this.i < this.temp.length) this._run();
    }

    load(taskName, entry, methods) {
        this.allFuc[taskName] = Object.assign({}, this.allFuc[taskName], methods);
        entry && (this.allState[taskName] = entry);
    }

    to(taskName) {
        var allState = this.allState;
        return function (state) {
            allState[taskName] = state;
        }
    }
}





