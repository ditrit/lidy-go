import japa from 'japa'
import * as lidy from '../lidy'
import { expect } from 'earljs'

japa.group('_copy keyword test using a dedicated Grammar ->', () => {
    japa.group('_copy keyword : ', () => {
        japa("The compiler should manage grammar rules that use the '_copy' fonctionnality", () => {
            expect(
                lidy.parse_file('test_dict_copy.yaml', 'test_dict_copy_def.yaml', 'artifact_type'),
            )
        })
    })
})
