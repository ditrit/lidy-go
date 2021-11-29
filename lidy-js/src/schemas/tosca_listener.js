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
        parsed_rule.value.forEach(val => {
            let newImport;
            let file = (val.type == 'string') ? val.value : val.value.file
            let repository = (val.value.repository) ? val.value.repository : ""
            let namespace_prefix = (val.value.namespace_prefix) ? val.value.namespace_prefix : ""
            let namespace_uri = (val.value.namespace_uri) ? val.value.namespace_uri : ""
            
            newImport = parsed_rule.ctx.prog.nodeFactory.newToscaImport({
                file, 
                repository, 
                namespace_prefix, 
                namespace_uri}, 
                val)
            // newImport = new ToscaImport({file,repository, namespace_prefix, namespace_uri}, val)
            parsed_rule.ctx.prog.imports.push(newImport)
        })
    },

    // exit_repositories(parsed_rule) {
    //     for (const key in parsed_rule.value) {
            
    //         if (val.type == 'string') {
    //             repository
    //         } else {
                
    //         }
    //         parsed_rule.ctx.prog.repositories[key] = new ToscaRepository(key, parsed_rule.value[key])
    //     }
    // }, 

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
