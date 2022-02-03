export default {
    exit_service_template(parsed_rule) {
        let val = parsed_rule.value
        let cst = parsed_rule.ctx.prog.current_service_template
        
        cst.tosca_definitions_version = val.tosca_definitions_version?.value
        cst.description = val.description?.value.tosca
        cst.metadata = val.metadata?.value.tosca
    }
}