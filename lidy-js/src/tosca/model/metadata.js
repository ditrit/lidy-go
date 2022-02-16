import { ToscaNode } from './prog.js'
import { ToscaVersion } from './version.js'

export class ToscaMetadata extends ToscaNode {
    constructor(input, source) { // input must be an array of MetadataLeaf
        super(source)
        this.metadatas = new Map()
        input.forEach(i => {
            this.metadatas.set(i.name, i)
        });
    }

    static isValid(input, source) {
        if (!Array.isArray(input)) {
            source.ctx.grammarError('Metadata input is not an array')
            return false
        } else {
            input.forEach(e => {
                if (!input instanceof MetadataLeaf) {
                    source.ctx.grammarError('Metadata input is not a valid MetadataLeaf')
                    return false
                }    
            });
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

export class MetadataLeaf {
    constructor(input) {
        this.name = input.name
        this.value = input.value
    }

    toString() {
        return `${this.name}: ${this.value}`
    }

    static isValid(input, source) {  // parsed_rule is given only for error management
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

export function newMetadataLeaf(input, source) {  // parsed_rule is given only for error management
    let res
    if (MetadataLeaf.isValid(input, source)) {
        res = new MetadataLeaf(input)
    } else {
        res = {}
    }
    return res
}