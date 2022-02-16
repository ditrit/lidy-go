import { newToscaNodeType } from "../model/node_type.js";

export default {
    exit_node_types(parsed_rule) {
        for (const key in parsed_rule.value) {
            parsed_rule.value[key].tosca.setId(key, parsed_rule, "node_types")
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