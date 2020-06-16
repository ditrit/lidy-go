import * as lidy from '../lidy'

describe('Tosca Grammar ->', function () {
    describe('metadata : ', function () {
        it('The compiler should accept simple metadata', function () {
            expect(
                lidy.parse_string(
                    `
  template_author: Xavier Talon
  template_name:   Un joli nom
`,
                    'tosca_definition.yaml',
                    'metadata',
                ),
            )
        })
    })
})
