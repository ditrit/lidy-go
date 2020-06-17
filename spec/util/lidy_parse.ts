import { parse_string_string } from '../../lidy'
import { expectError } from './expect_error'

export let parse = (schema: string, content: string) => {
    let formatted_schema = `main:\n${schema}`.replace(/\n/g, '\n  ')

    return parse_string_string(formatted_schema, content)
}

export let reject = (schema: string, content: string) => {
    try {
        expectError(() => parse(schema, content))
    } catch (e) {
        throw {
            stack: e.stack.replace(/^(.*\n).*\n/, '$1'),
        }
    }
}
