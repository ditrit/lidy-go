class ToscaProg {
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
    }

    toStringType(attribute) {
        let str = `\n ${attribute} : \n`
        for (const key in this[attribute]) {
            str += `    ${this[attribute][key]}\n`
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

        // str += "\n  Imports: \n"

        // str += "\n  Repositories: \n"

        // str += "\n  Description: \n"
        // str += "  "

        // str += "\n  Metadata: \n"
        // for (const key in this.metadata) {
        //     str += `    ${this.metadata[key]}\n`
        // }
        
        // str += "\n  Namespace: \n"
        
        return str
    }
}
class ToscaNode {
    constructor(source) {
        this.source = source
    }
}

class ToscaType extends ToscaNode {
    constructor(name, derived_from, version, metadata, description, source) {
        super(source)
        this.name = name
        if (derived_from) { this.derived_from = derived_from.value }
        if (version) { this.version = version.value }
        if (metadata) { this.metadata = metadata }
        if (description) { this.description = description.value }
    }
    toString() {
        // let str = `${this.constructor._classname}: `
        let str = `{name: ${this.name}, \n    Derived from: ${this.derived_from}, \n    Version : ${this.version}}\n`
        return str;
    }
}



// #######################
// ##### TOSCA NODES #####
// #######################
class ToscaDescription extends ToscaNode {
    constructor(value, source) {
        super(source)
        this.value = value
    }
    toString() {
        return `${this.value}`
    }
}

class ToscaMetadata extends ToscaNode {
    constructor(name, value, source) {
        super(source)
        this.name = name
        this.value = value.value
    }
    toString() {
        return `${this.name}: ${this.value}`
    }
}

class ToscaImport extends ToscaNode {
    constructor(file, repository, namespace_prefix, namespace_uri, source) {
        // super(source)
        // this.file = file
        
        // if(repository) { this.repository = repository }
        // if(namespace_prefix) { this.namespace_prefix = namespace_prefix }
        // if(namespace_uri) { this.namespace_uri = namespace_uri }
    }
}

class ToscaRepository extends ToscaNode {
    constructor(name, source) {
        super(source)
        this.name = name
    }
    toString() {
        return `${this.name}`
    }
}



class ToscaNamespace extends ToscaNode {
    constructor(value, source) {
        super(source)
        this.value = value
    }
    toString() {
        return `${this.value}`
    }
}


// #######################
// ##### TOSCA TYPES #####
// #######################

class ToscaNodeType extends ToscaType {
    constructor(name, derived_from, version, metadata, description, source) {
        super(name, derived_from, version, metadata, description, source)
    }
    static _classname = "node_type"
}

class ToscaRelationshipType extends ToscaType {
    constructor(name, derived_from, version, metadata, description, source) {
        super(name, derived_from, version, metadata, description, source)
    }
    static _classname = "relationship_type"
}

class ToscaDataType extends ToscaType {
    constructor(name, derived_from, version, metadata, description, source) {
        super(name, derived_from, version, metadata, description, source)
    }
    static _classname = "data_type"
}

class ToscaCapabilityType extends ToscaType {
    constructor(name, derived_from, version, metadata, description, source) {
        super(name, derived_from, version, metadata, description, source)
    }
    static _classname = "capability_type"
}

class ToscaArtifactType extends ToscaType {
    constructor(name, derived_from, version, metadata, description, source) {
        super(name, derived_from, version, metadata, description, source)
    }
    static _classname = "artifact_type"
}

class ToscaGroupType extends ToscaType {
    constructor(name, derived_from, version, metadata, description, source) {
        super(name, derived_from, version, metadata, description, source)
    }
    static _classname = "group_type"
}

class ToscaInterfaceType extends ToscaType {
    constructor(name, derived_from, version, metadata, description, source) {
        super(name, derived_from, version, metadata, description, source) 
    }
    static _classname = "interface_type"
}

class ToscaPolicyType extends ToscaType {
    constructor(name, derived_from, version, metadata, description, source) {
        super(name, derived_from, version, metadata, description, source)
    }
    static _classname = "policy_type"
}






// ##########################
// ##### LISTENER HOOKS #####
// ##########################

export default {
    enter_main(current) {
        current.ctx.prog = new ToscaProg()
    },

    exit_main(parsed_rule) {
        parsed_rule.ctx.prog.tosca_definitions_version = parsed_rule.value.tosca_definitions_version.value
        console.log("Fin de l'analyse");
    },

    // #######################
    // ##### TOSCA NODES #####
    // #######################

    exit_description(parsed_rule) {
        parsed_rule.ctx.prog.description = new ToscaDescription(parsed_rule.value, parsed_rule)
    },

    exit_metadata(parsed_rule) {
        for (const key in parsed_rule.value) {
            let val = parsed_rule.value[key]
            let metadata = new ToscaMetadata(key, val, val)
            parsed_rule.ctx.prog.metadata[key]=metadata
        }
    },

    exit_imports(parsed_rule) {
        // for (const key in parsed_rule.value) {
        //     let val = parsed_rule.value[key]

        //     if (val.type == 'string') {
        //         let newImport = new ToscaImport(val.value, null, null, null, parsed_rule)
        //     } else {
        //         let newImport = newImport(
        //             val.value.file ? val.value.file : null,
        //             val.value.repository ? val.value.repository : null,
        //             val.value.namespace_prefix ? val.value.namespace_prefix : null,
        //             val.value.namespace_uri ? val.value.namespace_uri : null
        //         )
        //     }
        //     parsed_rule.ctx.prog.imports.push(newImport)
        // }
    },

    exit_repositories(parsed_rule) {
        for (const key in parsed_rule.value) {
            parsed_rule.ctx.prog.repositories[key] = new ToscaRepository(key, parsed_rule.value[key])
        }
    }, 

    exit_namespace(parsed_rule) {
        parsed_rule.ctx.prog.namespace = new ToscaNamespace(parsed_rule.value, parsed_rule)
    },

    
    // #######################
    // ##### TOSCA TYPES #####
    // #######################

    exit_node_types(parsed_rule) {
        console.log("Sortie de NodeTypes");
        // console.log(parsed_rule);
        for (const key in parsed_rule.value) {
            let val = parsed_rule.value[key]
            let node_type = new ToscaNodeType(key, 
                val.value.derived_from ? val.value.derived_from : null,
                val.value.version ? val.value.version : null, 
                val.value.description ? val.value.description : null,
                val.value.metadata ? val.value.metadata : null, 
                val)
            val.tosca = node_type
            parsed_rule.ctx.prog.node_types[key] = node_type
        }
    },

    exit_relationship_types(parsed_rule) {
        console.log("Sortie de NodeTypes");
        // console.log(parsed_rule);
        for (const key in parsed_rule.value) {
            let val = parsed_rule.value[key]
            let relationship_type = new ToscaRelationshipType(key, 
                val.value.derived_from ? val.value.derived_from : null,
                val.value.version ? val.value.version : null, 
                val.value.description ? val.value.description : null,
                val.value.metadata ? val.value.metadata : null, 
                val)
            val.tosca = relationship_type
            parsed_rule.ctx.prog.relationship_types[key] = relationship_type
        }
    },

    exit_data_types(parsed_rule) {
        console.log("Sortie de data_types");
        // console.log(parsed_rule);
        for (const key in parsed_rule.value) {
            let val = parsed_rule.value[key]
            let data_type = new ToscaDataType(key, 
                val.value.derived_from ? val.value.derived_from : null,
                val.value.version ? val.value.version : null, 
                val.value.description ? val.value.description : null,
                val.value.metadata ? val.value.metadata : null, 
                val)
            val.tosca = data_type
            parsed_rule.ctx.prog.data_types[key] = data_type
        }
    },

    exit_capabilities_types(parsed_rule) {
        console.log("Sortie de CapabilitesTypes");
        // console.log(parsed_rule);
        for (const key in parsed_rule.value) {
            let val = parsed_rule.value[key]
            let capability_type = new ToscaCapabilityType(key, 
                val.value.derived_from ? val.value.derived_from : null,
                val.value.version ? val.value.version : null, 
                val.value.description ? val.value.description : null,
                val.value.metadata ? val.value.metadata : null, 
                val)
            val.tosca = capability_type
            parsed_rule.ctx.prog.capability_types[key] = capability_type
        }
    },

    exit_artifact_types(parsed_rule) {
        console.log("Sortie de artifact_types");
        // console.log(parsed_rule);
        for (const key in parsed_rule.value) {
            let val = parsed_rule.value[key]
            let artifact_type = new ToscaArtifactType(key, 
                val.value.derived_from ? val.value.derived_from : null,
                val.value.version ? val.value.version : null, 
                val.value.description ? val.value.description : null,
                val.value.metadata ? val.value.metadata : null, 
                val)
            val.tosca = artifact_type
            parsed_rule.ctx.prog.artifact_types[key] = artifact_type
        }
    },

    exit_group_types(parsed_rule) {
        console.log("Sortie de NodeTypes");
        // console.log(parsed_rule);
        for (const key in parsed_rule.value) {
            let val = parsed_rule.value[key]
            let group_type = new ToscaGroupType(key, 
                val.value.derived_from ? val.value.derived_from : null,
                val.value.version ? val.value.version : null, 
                val.value.description ? val.value.description : null,
                val.value.metadata ? val.value.metadata : null, 
                val)
            val.tosca = group_type
            parsed_rule.ctx.prog.group_types[key] = group_type
        }
    },

    exit_interface_types(parsed_rule) {
        console.log("Sortie de InterfaceTypes");
        // console.log(parsed_rule);
        for (const key in parsed_rule.value) {
            let val = parsed_rule.value[key]
            let interface_type = new ToscaInterfaceType(key, 
                val.value.derived_from ? val.value.derived_from : null,
                val.value.version ? val.value.version : null, 
                val.value.description ? val.value.description : null,
                val.value.metadata ? val.value.metadata : null, 
                val)
            val.tosca = interface_type
            parsed_rule.ctx.prog.interface_types[key] = interface_type
        }
    },

    exit_policy_types(parsed_rule) {
        console.log("Sortie de NodeTypes");
        // console.log(parsed_rule);
        for (const key in parsed_rule.value) {
            let val = parsed_rule.value[key]
            let policy_type = new ToscaPolicyType(key, 
                val.value.derived_from ? val.value.derived_from : null,
                val.value.version ? val.value.version : null, 
                val.value.description ? val.value.description : null,
                val.value.metadata ? val.value.metadata : null, 
                val)
            val.tosca = policy_type
            parsed_rule.ctx.prog.policy_types[key] = policy_type
        }
    },
}
