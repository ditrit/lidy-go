import { parse } from './parser/parse.js'

let res = parse({src_data: "{ a: 2, b: 3, c: true }", dsl_data: "main: { _map: { a: int, b: int}, _merge: [ {_oneOf: [{_map: { c: int}}, {_map: { c: boolean}} ] } ] }"})
console.log(res)
