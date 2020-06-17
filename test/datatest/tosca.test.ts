import japa from 'japa'
import * as lidy from '../../lidy'
import { data, schema } from '../pathList'

japa.group('Tosca Grammar -> service_template', () => {
    japa('The compiler should load main file of TOSCA normative types using TOSCA grammar', () => {
        lidy.parse_file(data.tosca, schema.tosca, 'service_template')
    })
})
