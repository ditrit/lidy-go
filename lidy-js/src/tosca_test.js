import { parse as parse_tosca } from './schemas/tosca.js'

export function parse(src) { 
    let res = parse_tosca({src_data: src})
    return res
}