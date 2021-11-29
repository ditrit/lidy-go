export class ToscaProg {
    constructor() {
        this.tosca_definitions_version = ""
        this.description = {}
        this.metadata = {}
        this.imports = []
        this.repositories = {}
        this.namespace = {}
        this.node_types = {}
        this.relationship_types = {}
        this.data_types = {}
        this.capability_types = {}
        this.artifact_types = {}
        this.group_types = {}
        this.interface_types = {}
        this.policy_types = {}
        // topologies à voir

        this.errors = []
        this.warnings = []
    }

    toStringType(tosca_type) {
        let str = `\n ${tosca_type} : \n`
        for (const key in this[tosca_type]) {
            let node_type = this[tosca_type][key]
            str += `    ${key}: ${node_type.toString()}\n`
        }
        return str
    }

    toString() {
        let str = "prog: \n"
        for (const key in this) {
            if (key.endsWith("_types")) {
                str += this.toStringType(key)
            }
        }
        str += this.toStringType("metadata");
        // str+= `  Tosca version: ${this.tosca_definitions_version}\n`

        str += "\n  Imports: \n"
        this.imports.forEach( e => str += e.toString())
        
        str += "\n  Repositories: \n    "
        str += `${Object.entries(this.repositories)}` //.reduce( e => str += `${e.toString()}`)
        str += "End repoditories"

        str += "\n  Description: \n"
        str += `  ${this.description}`

        // str += "\n  Metadata: \n"
        // for (const key in this.metadata) {
        //     str += `    ${this.metadata[key]}\n`
        // }
        
        // str += "\n  Namespace: \n"
        
        return str
    }
}

export class ToscaNode {
    constructor(source) {
        this.source = source
    }
}

export class ToscaType extends ToscaNode {
    constructor(input, source) {
        super(source)
        this.name= input.name
        if (input.derived_from) { this.derived_from = input.derived_from }
        if (input.version) { this.version = input.version }
        if (input.metadata) { this.metadata = input.metadata }
        if (input.description) { this.description = input.description }
    }
    toString() {
        // let str = `${this.constructor._classname}: `
        let str = `{name: ${this.name}, \n    Derived from: ${this.derived_from}, \n    Version : ${this.version}}\n`
        return str;
    }
    static isValid(input, source) {
        if (typeof(input.name) != 'string' || input.name == "" ||
            typeof(input.derived_from) != 'string' || 
            typeof(input.version) != 'string' || 
            typeof(input.metadata) != 'string' || 
            typeof(input.description) != 'string') {
            
            return false
        }
        return true
    }
}

export function newToscaType (input, source) {
    let res
    if (ToscaType.isValid(input, source)) {
        res = newToscaType(input, source)
    } else {
        res = {}
    }
    return res
}

// export default { ToscaProg, ToscaNode, ToscaType }