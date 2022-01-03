import { newToscaMetadata } from "../tosca/metadata.js";

export default {
    exit_metadata(parsed_rule) {
        for (const key in parsed_rule.value) {
            let metadata;
            let name = (key) ? key : ""
            let value = (parsed_rule.value[key]) ? parsed_rule.value[key].value : ""
            
            metadata = newToscaMetadata({name, value}, parsed_rule)
            parsed_rule.tosca = metadata
            // parsed_rule.ctx.prog.metadata[key] = metadata
        }
    }
}