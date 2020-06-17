import japa from 'japa'
import * as lidy from '../../lidy'
import { schema, data } from '../pathList'

japa.group('_copy', () => {
    japa("The compiler should manage grammar rules that use the '_copy' fonctionnality", () => {
        lidy.parse_file(data.copy, schema.copy, 'artifact_type')
    })
})
