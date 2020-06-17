import japa from 'japa'
import { parse, reject } from '../util/lidy_parse'

japa.group('_listOf', () => {
    const SCHEMA = `_dictOf: { str: int }`

    japa('accept the empty dict', () => {
        parse(SCHEMA, '{}')
    })

    japa('accept dict with one matching-matching entry', () => {
        parse(SCHEMA, '{ va: 0 }')
    })

    japa('accept dict with several matching-matching entries', () => {
        parse(SCHEMA, '{ va: 0, vb: 1, vc: 2 }')
    })

    japa('reject non-dict', () => {
        reject(SCHEMA, '[]')
        reject(SCHEMA, '0')
        reject(SCHEMA, '""')
        reject(SCHEMA, 'true')
    })

    japa('reject dict with non-matching values', () => {
        reject(SCHEMA, '{ va: vz }')
        reject(SCHEMA, '{ va: 0.1 }')
        reject(SCHEMA, '{ va: true }')
        reject(SCHEMA, '{ va: 2020-06-17T10:13:46 }')
        reject(SCHEMA, '{ va: [] }')
        reject(SCHEMA, '{ va: {} }')
    })

    japa('reject dict with non-matching keys', () => {
        reject(SCHEMA, '{ 2: 9 }')
        reject(SCHEMA, '{ 0.1: 9 }')
        reject(SCHEMA, '{ true: 9 }')
        reject(SCHEMA, '{ []: 9 }')
        reject(SCHEMA, '{ {}: 9 }')
    })
})
