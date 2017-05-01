export default class ManyStateMachine {
    constructor(temp) {
        this.temp = temp || '';//解析模板 
        this.i = 0;//模板读取位置 
        this.allFuc = {}; //状态切换函数队列
        this.allState = {};//记录所有状态 
        this.stateHandle = function noon() { };//状态处理函数
    }
    _run() {
        //运行状态切换函数队列
        var taskName, newAllState = {};
        for (taskName in this.allFuc) {
            let myfucs = this.allFuc[taskName], myState = this.allState[taskName];
            newAllState[taskName] = myfucs[myState].call(this, this.temp, this.temp[this.i], this.i);
        }
        var count = this.stateHandle.call(this, this.allState, this.temp, this.temp[this.i], this.i);
        if (count != undefined) this.i = count;
        for (taskName in newAllState) {
            let state = newAllState[taskName];
            state && (this.allState[taskName] = state);
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

    loadHandle(handle) {
        this.stateHandle = handle;
    }
}





