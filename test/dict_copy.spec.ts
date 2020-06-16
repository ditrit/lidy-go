import * as lidy from '../lidy'

describe('_copy keyword test using a dedicated Grammar ->', function () {
    describe('_copy keyword : ', function () {
        it("The compiler should manage grammar rules that use the '_copy' fonctionnality", function () {
            expect(
                lidy.parse_file(
                    'test_dict_copy.yaml',
                    'test_dict_copy_def.yaml',
                    'artifact_type',
                ),
            )
        })
    })
})
