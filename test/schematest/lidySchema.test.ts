// Check that the lidy schema detect itself as valid
// It runs the lidy meta-schema against itself
import japa from 'japa'
import * as lidy from '../../lidy'

japa.group('lidy-schema', () => {
    japa('The lidy schema should be a valid lidy schema', () => {
        lidy.parse_file(lidy.__path.lidySchema, lidy.__path.lidySchema, 'main')
    })
})
