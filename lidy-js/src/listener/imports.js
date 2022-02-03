import { newToscaImport } from '../tosca/imports.js'

function exit_imports(parsed_rule) {
    parsed_rule.value.forEach(val => {
        let newImport;
        let file = (val.type == 'string') ? val.value : val.value.file.value
        let currentPath = parsed_rule.ctx.prog.currentPath
        let repository = (val.value.repository) ? val.value.repository.value : ""
        let namespace_prefix = (val.value.namespace_prefix) ? val.value.namespace_prefix.value : ""
        let namespace_uri = (val.value.namespace_uri) ? val.value.namespace_uri.value : ""
        
        newImport = newToscaImport({
            file, 
            currentPath, 
            repository, 
            namespace_prefix, 
            namespace_uri}, 
            val)
        parsed_rule.ctx.prog.current_service_template.imports.push(newImport)
        // parsed_rule.ctx.prog.imports.push(newImport)
    })
}
export default { exit_imports } 