import { newToscaNodeType } from "../tosca/node_type.js";

export default {
    exit_node_types(parsed_rule) {
        for (const key in parsed_rule.value) {
            let node_type = parsed_rule.value[key].tosca
            // node_type.setName(key)
            
            parsed_rule.ctx.prog.current_service_template.node_types[key] = node_type
        }
    },

    exit_node_type(parsed_rule) {
        newToscaNodeType({
            derived_from: parsed_rule.value.derived_from?.value,
            version: parsed_rule.value.version?.tosca,
            description: parsed_rule.value.description?.tosca,
            metadata: parsed_rule.value.metadata?.tosca,
        }, 
            parsed_rule)
    }
}