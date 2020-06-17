// Check that the lidy schema detect itself as valid
// It runs the lidy meta-schema against itself
import japa from 'japa'
import * as lidy from '../../lidy'
import { schema } from '../pathList'

japa.group('general schema', () => {
    Object.entries(schema).forEach(([key, schemaPath]) => {
        japa(`the ${key} schema should be valid`, () => {
            lidy.parse_file(schemaPath, lidy.__path.lidySchema, 'main')
        })
    })
})
