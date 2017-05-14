export const directiveModel = {
    template2Vnode: function (el, dir, vm) {
        let delimiters = vm.$options.delimiters
        el.attrsMap.value = delimiters[0] + dir.expression + delimiters[1];
        el.events.input = function (e) { 
            let el = e.target;
            let value = el.value;
            let exp = el.getAttribute('m-model');
            var target, key;
            //数组
            var match = exp.match(/(.+)\[(\d+)\]$/);
            if (match) {
                target = eval(match[1]);
                key = match[2]
            } else {
                match = exp.match(/(.+)\.(\w+)$/);
                if (match) {
                    target = eval(match[1]);
                    key = match[2]
                } else {
                    target = $data;
                    key = exp;
                    try {
                        value = JSON.parse(value);
                    } catch (e) {

                    }
                }
            }

            MVVM.$set(target, key, value);
        }
    }
}