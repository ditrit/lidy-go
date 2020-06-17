import japa from 'japa'
import * as lidy from '../../lidy'
import { schema } from '../pathList'

japa.group('Tosca Grammar -> metadata', () => {
    japa('The compiler should accept simple metadata', () => {
        lidy.parse_string(
            `
  template_author: Xavier Talon
  template_name:   Un joli nom
`,
            schema.tosca,
            'metadata',
        )
    })
})
