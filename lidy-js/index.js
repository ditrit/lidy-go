import { parse } from './parser/parse.js'

let res = parse({src_data: "{ a: 5, b: va, e: 3.4, c: 5.3 }", dsl_data: "main: { _map: { a: integer, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"})
console.log(res)