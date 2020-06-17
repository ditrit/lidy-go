import japa from 'japa'
import { parse, reject } from '../util/lidy_parse'

japa.group('_listOf', () => {
    const SCHEMA = `_listOf: str`

    japa('reject the empty list', () => {
        reject(SCHEMA, '[]')
    })

    japa('accept one string', () => {
        parse(SCHEMA, '[va, vb]')
    })

    japa('accept a lot of strings', () => {
        parse(SCHEMA, '[va, vb, vc, vd, ve, vf]')
    })

    japa('reject non-lists', () => {
        reject(SCHEMA, '{}')
        reject(SCHEMA, '0')
        reject(SCHEMA, '""')
        reject(SCHEMA, 'true')
    })

    japa('reject lists with non-matching elements', () => {
        reject(SCHEMA, '[2]')
        reject(SCHEMA, '[va, 4]')
        reject(SCHEMA, '[5, va]')
        reject(SCHEMA, '[3, 4]')
    })
})
