import japa from 'japa'
import * as lidy from '../lidy'
import { expect } from 'earljs'

japa.group('Tosca Grammar ->', () => {
    japa.group('metadata : ', () => {
        japa('The compiler should accept simple metadata', () => {
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
