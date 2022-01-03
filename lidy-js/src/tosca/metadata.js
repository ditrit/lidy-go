import { ToscaNode } from './prog.js'
import { ToscaVersion } from './version.js'

export class ToscaMetadata extends ToscaNode {
    constructor(input, source) {
        super(source)
        this.name = input.name
        this.value = input.value
    }
    toString() {
        return `${this.name}: ${this.value}`
    }
    static isValid(input, source) {
        if (typeof(input.name) != 'string' || 
            input.name == "" || 
            typeof(input.value) != 'string' ||
            input.value == "" || ( input.name == 'template_version' && !input.value instanceof ToscaVersion )) {
            
            source.ctx.grammarError('Incorrect input for metadata')
            return false
            }
        return true
    }
}

export function newToscaMetadata(input, source) {
    let res
    if (ToscaMetadata.isValid(input, source)) {
        res = new ToscaMetadata(input, source)
    } else {
        res = {}
    }
    return res
}