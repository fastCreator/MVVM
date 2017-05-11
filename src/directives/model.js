export const directiveModel = {
    template2Vnode: function (el,dir,vm) { 
        let delimiters=vm.$options.delimiters
         el.attrsMap.value=delimiters[0]+dir.expression+delimiters[1];
         el.events.input=function(e){
             let el =e.target;
             $data[el.getAttribute('m-model')]=el.value; 
         }
    }
}