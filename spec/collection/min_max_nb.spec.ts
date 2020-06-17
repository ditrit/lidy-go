import japa from 'japa'
import { parse } from '../util/lidy_parse'
import { expectError } from '../util/expect_error'

const LIST_OF_ANY = `
_listOf: any
{}`

const DICT_OF_ANY = `
_dictOf: { any: any }
{}`

//
// LIST //
//
japa.group('_min for list', () => {
    const MIN_2 = LIST_OF_ANY.replace('{}', '_min: 2')

    japa('accept', () => {
        parse(MIN_2, '[a, b]')
    })

    japa('reject', () => {
        expectError(() => parse(MIN_2, '[a]')).toMatch('at least 2 element')
    })
})

japa.group('_max for list', () => {
    const MAX_2 = LIST_OF_ANY.replace('{}', '_max: 2')

    japa('accept', () => {
        parse(MAX_2, '[a, b]')
    })

    japa('reject', () => {
        expectError(() => parse(MAX_2, '[a, b, c]')).toMatch('at most 2 element')
    })
})

japa.group('_nb for list', () => {
    const NB_2 = LIST_OF_ANY.replace('{}', '_nb: 2')

    japa('accept', () => {
        parse(NB_2, '[a, b]')
    })

    japa('reject', () => {
        expectError(() => parse(NB_2, '[a, b, c]')).toMatch('have 2 element')
    })
})

//
// DICT //
//
japa.group('_min for dict', () => {
    const MIN_2 = DICT_OF_ANY.replace('{}', '_min: 2')

    japa('accept', () => {
        parse(MIN_2, '{ ka: va, kb: vb }')
    })

    japa('reject', () => {
        expectError(() => parse(MIN_2, '{ ka: va }')).toMatch('at least 2 element')
    })
})

japa.group('_max for dict', () => {
    const MAX_2 = DICT_OF_ANY.replace('{}', '_max: 2')

    japa('accept', () => {
        parse(MAX_2, '{ ka: va, kb: vb }')
    })

    japa('reject', () => {
        expectError(() => parse(MAX_2, '{ ka: va, kb: vb, kc: vc }')).toMatch('at most 2 element')
    })
})

japa.group('_nb for dict', () => {
    const NB_2 = DICT_OF_ANY.replace('{}', '_nb: 2')

    japa('accept', () => {
        parse(NB_2, '{ ka: va, kb: vb }')
    })

    japa('reject', () => {
        expectError(() => parse(NB_2, '{ ka: va }')).toMatch('have 2 element')
    })
})
