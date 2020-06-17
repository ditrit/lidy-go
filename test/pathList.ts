import { join } from 'path'

export let data = {
    copy: join(__dirname, 'fixture', 'copy.yaml'),
    tosca: join(__dirname, 'fixture', 'tosca.yaml'),
}

export let schema = {
    copy: join(__dirname, 'fixture', 'copy.schema.yaml'),
    tosca: join(__dirname, 'fixture', 'tosca.schema.yaml'),
}
