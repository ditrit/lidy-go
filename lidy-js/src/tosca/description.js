import { ToscaNode } from './prog.js'

export class ToscaDescription extends ToscaNode {
    constructor(value, source) {
        super(source)
        this.value = value
    }
    toString() {
        return `${this.value}`
    }
    static isValid(input, source) {
        if (typeof(input) != 'string' || input == "") {
            source.ctx.grammarError('Incorrect input for description')
            return false
        } else {
            return true
        }
    }
}

export function newToscaDescription(input, source) {
    let res
    if ( ToscaDescription.isValid(input, source)) {
        res = new ToscaDescription(input, source)
    } else {
        res = {}
    }
    return res
}