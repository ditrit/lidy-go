// import japa from 'japa'
// import { parse } from '../util/lidy_parse'
// import { expectError } from '../util/expect_error'

// japa.group('_range 0 1', () => {
//     const SCHEMA = '_range: (0 <= float < 1)'

//     japa('accept 0', () => {
//         parse(SCHEMA, '0')
//     })

//     japa('accept 0.5', () => {
//         parse(SCHEMA, '0.5')
//     })

//     japa('reject 2', () => {
//         expectError(() => parse(SCHEMA, '2'))
//     })

//     japa('reject "0"', () => {
//         expectError(() => parse(SCHEMA, '"0"'))
//     })
// })
