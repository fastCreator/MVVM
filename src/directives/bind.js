export const directiveModel = {
    template2Vnode: function (el, dir) {
        console.log(dir)
        el.events.input = function (e) {
            $data[dir.express] = e.target.value;
        }
    }
}