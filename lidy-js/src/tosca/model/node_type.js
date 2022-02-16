import { ToscaNode, ToscaType } from './prog.js'

export class ToscaNodeType extends ToscaType {
    constructor(input, source) {
        super(input, source)
        // this.classname = 'node_type'
    }

    static _classname = 'node_type'
    
    getClassname() {
        return ToscaNodeType._classname
    }

    toString() {
        return super.toString()
    }
    static isValid(input, source) {
        if(!ToscaType.isValid(input, source)) {
            
            source.ctx.typeError(source.current, 'Incorrect definition for NodeType')
            return false
        }
        return true
    }
}

export function newToscaNodeType(input, source) {
    let res
    if (ToscaNodeType.isValid(input, source)) {
        res = new ToscaNodeType(input, source)
    } else {
        res = {}
    }
    return res
}