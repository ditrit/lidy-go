import { parse } from './parser/parse.js'

let res = parse({src_data: "{ r: 5 }", dsl_data: "{ main: { _merge: [ reference ] }, reference: { _map: {r: int} } }"})
console.log(res)
