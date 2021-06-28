import { grammar_compile, parse } from './parser/node_parse.js'

let res = grammar_compile({dsl_file: "../schemas/schema.tosca.yaml"})
//let res = parse({src_file: './tests/test.yaml', dsl_file: '../schemas/schema.lidy.yaml'})
console.log(JSON.stringify(res, null, 2))
