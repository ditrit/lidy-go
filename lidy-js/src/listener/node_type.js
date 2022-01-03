import { newToscaNodeType } from "../tosca/node_type.js";

export default {
    exit_node_types(parsed_rule) {
        for (const key in parsed_rule.value) {
            let val = parsed_rule.value[key]
            let node_type;
            let name = key
            let derived_from = (val.value.derived_from) ? val.value.derived_from.value : ""
            let version = (val.value.version) ? val.value.version.tosca : null
            let description = (val.value.description) ? val.value.description.tosca : null
            let metadata = (val.value.metadata) ? val.value.metadata.tosca : ""
            

            node_type = newToscaNodeType({
                name, 
                derived_from, 
                version, 
                description, 
                metadata
            }, 
                val)

            parsed_rule.ctx.prog.node_types[key] = node_type
        }
    }
}