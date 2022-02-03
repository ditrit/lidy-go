import { newToscaNamespace } from "../tosca/namespace.js"

export default {
    exit_namespaces(parsed_rule) {
        let namespace = (parsed_rule.value) ? parsed_rule.value : ""
        parsed_rule.ctx.prog.current_service_template.namespace = newToscaNamespace(namespace, parsed_rule)
    }
}