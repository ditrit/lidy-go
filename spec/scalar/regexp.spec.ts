import japa from 'japa'
import { parse, reject } from '../util/lidy_parse'
import { expectError } from '../util/expect_error'

japa.group('_regexp empty', () => {
    const SCHEMA = '_regexp: "^$"'

    japa('accept empty string', () => {
        parse(SCHEMA, '""')
    })

    japa('reject letter', () => {
        expectError(() => parse(SCHEMA, 'a')).toMatch(`'a' does not match`)
    })

    japa('reject space', () => {
        expectError(() => parse(SCHEMA, '" "')).toMatch(`' ' does not match`)
    })
})

japa.group('_regexp email', () => {
    const SCHEMA = '_regexp: "^[a-zA-Z0-9]+([.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.][a-zA-Z0-9]+)+$"'

    japa('accept email', () => {
        parse(SCHEMA, 'a@b.c')
        parse(SCHEMA, 'a.b.c@0.23.z')
    })

    japa('reject non-email', () => {
        reject(SCHEMA, 'a@b')
        reject(SCHEMA, '.a@b.c')
    })
})

japa.group('_regex non-empty word', () => {
    const SCHEMA = '_regexp: "[a-z]+"'

    japa('accept non-empty word', () => {
        parse(SCHEMA, 'a')
        parse(SCHEMA, 'word')
    })

    japa('reject the empty string', () => {
        reject(SCHEMA, '""')
    })

    japa('reject if not a string', () => {
        reject(SCHEMA, '1')
        reject(SCHEMA, '1.1')
        reject(SCHEMA, 'true')
        reject(SCHEMA, 'null')
        reject(SCHEMA, '[]')
        reject(SCHEMA, '{}')
    })

    japa('reject if not a string (null)', () => {
        expectError(() => parse(SCHEMA, 'null')).toMatch(`'null' does not match`)
    })

    japa.skip('reject if not a string (void)', () => {
        expectError(() => parse(SCHEMA, '')).toMatch(`does not match`)
    })
})
