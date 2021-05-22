import { parse } from './parser/parse.js'

let res = parse({src_data: "[ 5, va, vb ]", dsl_data: "main: { _min: 3, _list: [integer, string], _listFacultative: [ string, integer, boolean ], _listOf: float }"})
console.log(res)