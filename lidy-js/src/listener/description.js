import { newToscaDescription } from "../tosca/description.js"

export default {
    exit_description(parsed_rule) {
        let description = (parsed_rule.value) ? parsed_rule.value : ""
        parsed_rule.ctx.prog.description = newToscaDescription(description, parsed_rule)
    }
}