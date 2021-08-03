import { parse } from '../parser/node_parse.js'
//import { parse } from './parser/parse.js'


//preprocess("../schemas/tosca.yaml")
//parse({dsl_json: "../schema/tosca.json", src_data: "tosca_definitions_version: tosca_simple_yaml_1_2", keyword: "service_template"})
//parse({dsl_json: "./tosca.js", src_data: "tosca_definitions_version: tosca_1.2", keyword: "service_template"}).then( res  => {
//    console.log(res)
//})

let res = parse({src_file: "../schemas/schema.lidy.yaml", dsl_file: '../schemas/schema.lidy.yaml'})
console.log(res)
console.log(res.success())


