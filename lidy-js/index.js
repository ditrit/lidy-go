import { parse } from './parser/parse.js'

let res4 = parse({src_data: "{titi: 1.2}", dsl_data: 'main: { _oneOf: [ { _listOf: string }, { _map: { titi: float } } ] }'})
console.log(res4)
