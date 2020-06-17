import japa from 'japa'
import { parse, reject } from '../util/lidy_parse'
import { scalarObject, collectionObject } from './typeObject'

/**
 * For each scalar type, accept the example, but reject examples of any other types
 */
Object.entries(scalarObject).forEach(([SCHEMA, example]) => {
    let rejectObject = { ...scalarObject, ...collectionObject }
    delete rejectObject[SCHEMA]

    japa.group(SCHEMA, () => {
        japa('accept', () => {
            parse(SCHEMA, example)
        })

        Object.entries(rejectObject).forEach(([key, value]) => {
            japa(`reject ${key}`, () => {
                reject(SCHEMA, value)
            })
        })
    })
})
