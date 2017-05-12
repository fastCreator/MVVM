import snabbdom from 'snabbdom'

import klass from 'snabbdom/modules/class'
import props from 'snabbdom/modules/props'
import attrs from 'snabbdom/modules/attributes'
import style from 'snabbdom/modules/style'
import eventlisteners from 'snabbdom/modules/eventlisteners'

export { createElement } from 'snabbdom/htmldomapi'
export const h = require('snabbdom/h').default;
export const VNode = require('snabbdom/vnode').default; 

export const patch = snabbdom.init([klass, props, attrs, style, eventlisteners])