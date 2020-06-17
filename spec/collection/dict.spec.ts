import japa from 'japa'
import { parse, reject } from '../util/lidy_parse'

japa.group('_dict 2 entries', () => {
    const SCHEMA = `_dict: { a: str, b: int }`

    japa('accept when all entries are present and valid', () => {
        parse(SCHEMA, '{ a: va, b: 4 }')
    })

    japa('accept when only some entries are present', () => {
        parse(SCHEMA, '{ a: va }')
        parse(SCHEMA, '{ b: 4 }')
    })

    japa('accept the empty dict', () => {
        parse(SCHEMA, '{}')
    })

    japa('reject nodes that are not dictionaries', () => {
        reject(SCHEMA, '[]')
        reject(SCHEMA, '0')
        reject(SCHEMA, '""')
        reject(SCHEMA, 'true')
    })

    japa('reject unknown entries', () => {
        reject(SCHEMA, '{ z: 12 }')
    })

    japa('reject if an entry does not match', () => {
        reject(SCHEMA, '{ a: 12 }')
    })
})

japa.group('_dict 0 entry', () => {
    const SCHEMA = `_dict: {}`

    japa('accept the empty dict', () => {
        parse(SCHEMA, '{}')
    })

    japa('reject any (unknown) entry', () => {
        reject(SCHEMA, '{ a: va }')
        reject(SCHEMA, '{ b: 4 }')
    })

    japa('reject nodes that are not dictionaries', () => {
        reject(SCHEMA, '[]')
    })
})
