import japa from 'japa'
import { parse, reject } from '../util/lidy_parse'

japa.group('_list with 2 entries', () => {
    const SCHEMA = `_list: [str, int]`

    japa('accept when all entries are present and valid', () => {
        parse(SCHEMA, '[va, 4]')
    })

    japa('reject lists with insufficiently many elements', () => {
        reject(SCHEMA, '[va, 4, extra]')
    })

    japa('reject nodes that are not a list', () => {
        reject(SCHEMA, '{}')
        reject(SCHEMA, '0')
        reject(SCHEMA, '""')
        reject(SCHEMA, 'true')
    })

    japa('reject lists with too many elements', () => {
        reject(SCHEMA, '[va, 4, extra]')
    })

    japa('reject if an entry does not match', () => {
        reject(SCHEMA, '[12, 4]')
        reject(SCHEMA, '[va, vb]')
    })
})

japa.group('_list with 0 entry', () => {
    const SCHEMA = `_list: []`

    japa('accept the empty tuple', () => {
        parse(SCHEMA, '[]')
    })

    japa('reject any non-empty tuple', () => {
        reject(SCHEMA, '[va]')
        reject(SCHEMA, '[4]')
    })

    japa('reject nodes that are not lists', () => {
        reject(SCHEMA, '{}')
    })
})
