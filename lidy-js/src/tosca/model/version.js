import { ToscaNode } from './prog.js'

export class ToscaVersion extends ToscaNode {
    constructor(value, source) {
        super(source)
        this.value = value
    }
    toString() {
        return `Version : ${this.value}`
    }
    static isValid(input, source) {
        if (typeof(input) != 'string' || input == "") {
            source.ctx.grammarError('Incorrect input for version')
            return false
        } else {
            return true
        }
    }
}

export function newToscaVersion(input, source) {
    let res
    if ( ToscaVersion.isValid(input, source)) {
        res = new ToscaVersion(input, source)
    } else {
        res = {}
    }
    return res
}