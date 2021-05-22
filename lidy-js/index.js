import { parse } from './parser/parse.js'

let res = parse({src_data: "11", dsl_data: "main: string"})
console.log(res)