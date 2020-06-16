import * as lidy from '../lidy'

describe('Tosca Grammar ->', function () {
    describe('service_template : ', function () {
        it('The compiler should load main file of TOSCA normative types using TOSCA grammar', function () {
            expect(
                lidy.parse_file(
                    'tosca_types.yaml',
                    'tosca_definition.yaml',
                    'service_template',
                ),
            )
        })
    })
})
