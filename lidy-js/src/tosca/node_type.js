import { ToscaNode, ToscaType } from './prog.js'

export class ToscaNodeType extends ToscaType {
    constructor(input, source) {
        super(input, source)
    }
    static _classname = "node_type"
    toString() {
        return super.toString()
    }
    static isValid(input, source) {
        if(!ToscaType.isValid(input, source)) {
            
            source.ctx.grammarError('Incorrect input for NodeType')
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