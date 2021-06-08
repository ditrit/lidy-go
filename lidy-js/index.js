import { parse } from './parser/parse.js'

let res = parse({src_file: '../schemas/schema.tosca.yaml', dsl_file: '../schemas/schema.lidy.yaml'})
//let res = parse({src_file: './tests/test.yaml', dsl_file: '../schemas/schema.lidy.yaml'})
console.log(res)
console.log('ERRORS :') 
console.log(res.errors)
