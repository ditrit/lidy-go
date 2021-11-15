import { parse as parse_tosca } from './schemas/tosca.js'
import listener from "./schemas/tosca_listener.js"
import fs from "fs"
// import { preprocess } from './parser/node_parse.js'

export function parse(src) { 
    let src_data = fs.readFileSync(src, 'utf8')
    let res = parse_tosca({src_data, listener})
    return res
}

// Preprocess Tosca grammar in Lidy format to a JSON rule's file
// preprocess("./schemas/tosca.yaml")

// let res2 = parse("tosca.yaml")

let res2 = parse("./lidy-js/ToscaExample.yml")
// console.log(res2)

// if (res2.errors.length == 0) {
//     console.log(res2.contents)
// } else {
//     console.log(res2.errors);
// }
// if (res2.warnings.length != 0) {
//     console.log(res2.warnings);
// }