import japa from 'japa'
import { parse } from '../util/lidy_parse'
import { scalarObject, collectionObject } from './typeObject'

japa.group('any', () => {
    const SCHEMA = 'any'

    let exampleList = [...Object.entries(scalarObject), ...Object.entries(collectionObject)]

    exampleList.forEach(([kind, example]) => {
        japa(`accept ${kind}`, () => {
            parse(SCHEMA, example)
        })
    })
})
