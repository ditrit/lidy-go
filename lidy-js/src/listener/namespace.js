import { newToscaNamespace } from "../tosca/namespace.js"

export default {
    exit_namespaces(parsed_rule) {
        let namespace = (parsed_rule.value) ? parsed_rule.value : ""
        parsed_rule.ctx.prog.description = newToscaNamespace(namespace, parsed_rule)
    }
}