import { ToscaProg } from '../tosca/prog.js'

function exit_main(parsed_rule) {
    parsed_rule.ctx.prog.tosca_definitions_version = parsed_rule.value.tosca_definitions_version.value
}

export default { exit_main }