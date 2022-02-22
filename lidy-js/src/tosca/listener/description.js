import { newToscaDescription } from "../model/description.js"

export default {
    exit_description(parsed_rule) {
        let description = (parsed_rule.value) ? parsed_rule.value : ""
        newToscaDescription(description, parsed_rule)
    }
}