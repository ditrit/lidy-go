import { newToscaRepository } from "../tosca/repository.js"

function exit_repositories(parsed_rule) {
    for (const key in parsed_rule.value) {
        let val = parsed_rule.value[key]
        let repository
        let name = key
        let url = (val.type == 'string') ? val.value : val.value.url.value
        let description = (val.value.description) ? val.value.description.value : ""
        let token = (val.value.token) ? val.value.token.value : ""
        let prototol = (val.value.prototol) ? val.value.prototol.value : ""
        let token_type = (val.value.token_type) ? val.value.token_type.value : ""
        let user = (val.value.user) ? val.value.user.value : ""

        repository = newToscaRepository(
            {name, 
            url, 
            description, 
            token, 
            prototol, 
            token_type, 
            user}, 
            val)
        parsed_rule.ctx.prog.repositories[key] = repository
    }
}

export default { exit_repositories }