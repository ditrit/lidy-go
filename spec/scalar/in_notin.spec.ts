import japa from 'japa'
import { expectError } from '../util/expect_error'
import { parse } from '../util/lidy_parse'

japa.group('_in', () => {
    const SCHEMA = `_in: [a, present, b, c]`

    japa('accept', () => {
        parse(SCHEMA, 'present')
    })

    japa('reject', () => {
        expectError(() => parse(SCHEMA, 'missing')).toMatch('missing')
    })
})

japa.group('_notin', () => {
    const SCHEMA = `_notin: [a, forbidden, b, c]`

    japa('accept', () => {
        parse(SCHEMA, 'allowed')
    })

    japa('reject', () => {
        expectError(() => parse(SCHEMA, 'forbidden')).toMatch('forbidden')
    })
})
