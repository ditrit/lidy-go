import japa from 'japa'
import { parse, reject } from '../util/lidy_parse'

japa.group('_oneOf scalar', () => {
    const SCHEMA = `_oneOf: [ boolean, int ]`

    japa('accept booleans', () => {
        parse(SCHEMA, 'false')
        parse(SCHEMA, 'true')
    })

    japa('accept integers', () => {
        parse(SCHEMA, '0')
        parse(SCHEMA, '1')
        parse(SCHEMA, '99999')
        parse(SCHEMA, '-0')
        parse(SCHEMA, '-1')
        parse(SCHEMA, '-99999')
    })

    japa('reject non-booleans non-integers', () => {
        reject(SCHEMA, 'vz')
        reject(SCHEMA, '0.1')
        reject(SCHEMA, '2020-06-17T10:13:46')
        reject(SCHEMA, '[]')
        reject(SCHEMA, '{}')
    })
})

japa.group('_oneOf dict', () => {
    const SCHEMA = `_oneOf: [ { _dictOf: { str: str } } ]`

    japa('accept the empty dict', () => {
        parse(SCHEMA, '{}')
    })

    japa('accept dict with matching-matching entries', () => {
        parse(SCHEMA, '{ ka: va }')
        parse(SCHEMA, '{ ka: va, kb: vb }')
        parse(SCHEMA, '{ 0k: 0v }')
        parse(SCHEMA, '{ ka: va, kb: vb, 0k: 0v }')
    })

    japa('reject non-dicts', () => {
        reject(SCHEMA, 'vz')
        reject(SCHEMA, '0.1')
        reject(SCHEMA, '[]')
    })
})
