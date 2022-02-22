import { ToscaType } from './prog.js'

export class ToscaServiceTemplate {
    constructor() {
        this.tosca_definitions_version = ""
        this.description = {}
        this.metadata = {}
        this.imports = []
        this.repositories = {}
        this.namespace = {value: ""}
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
        this.tosca_types = []
    }

    toStringType(tosca_type) {
        let str = `\n ${tosca_type} : \n`
        for (const key in this[tosca_type]) {
            let node_type = this[tosca_type][key]
            str += `    ${key}: ${node_type}\n`
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
        return str
    }
}

export function newToscaServiceTemplate(input, source) {

}