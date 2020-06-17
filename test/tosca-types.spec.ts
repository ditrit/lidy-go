import japa from 'japa'
import * as lidy from '../lidy'
import { expect } from 'earljs'

japa.group('Tosca Grammar -> service_template', () => {
    japa('The compiler should load main file of TOSCA normative types using TOSCA grammar', () => {
        expect(lidy.parse_file('tosca_types.yaml', 'tosca_definition.yaml', 'service_template'))
    })
})
