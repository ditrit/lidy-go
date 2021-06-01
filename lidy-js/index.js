import { parse } from './parser/parse.js'

let res = parse({src_file: "../schema.lidy.yaml", dsl_file: "../schema.lidy.yaml"})
let val = res.result().value
console.log(val)
console.log('ERRORS :') 
console.log(res.errors)
