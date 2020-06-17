import japa from 'japa'
import { parse } from '../util/lidy_parse'
import { expectError } from '../util/expect_error'

japa.group('_regexp empty', () => {
    const SCHEMA = '_regexp: "^$"'

    japa('accept', () => {
        parse(SCHEMA, '""')
    })

    japa('reject', () => {
        expectError(() => parse(SCHEMA, 'a')).toMatch(`'a' does not match`)
    })
    japa('reject', () => {
        expectError(() => parse(SCHEMA, '" "')).toMatch(`' ' does not match`)
    })
    japa('reject if not a string (null)', () => {
        expectError(() => parse(SCHEMA, 'null')).toMatch(`'null' does not match`)
    })
    japa.skip('reject if not a string (void)', () => {
        expectError(() => parse(SCHEMA, '')).toMatch(`'' does not match`)
    })
})
