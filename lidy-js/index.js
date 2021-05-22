import { parse } from './parser/parse.js'

let res = parse({src_data: "70.10 F", dsl_data: "main: float"})
console.log(res)