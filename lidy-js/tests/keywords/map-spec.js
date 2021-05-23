import { parse } from '../../parser/parse.js'

describe("Map expressions ->", function() {

    describe("empty map : ", function() {

        it("accept empty map",
            function() { expect( parse({src_data: "{}", dsl_data: "main: { _map: {} }"}).result().isEmpty()).toEqual(true)})

        it("reject non empty map",
            function() { expect( parse({src_data: "{a: 1}", dsl_data: "main: { _map: {} }"}).fails()).toEqual(true)})

        it("reject non empty map (of one null element)",
            function() { expect( parse({src_data: "{a: ~}", dsl_data: "main: { _map: {} }"}).fails()).toEqual(true)})

        it("reject non empty map (of several elements)",
            function() { expect( parse({src_data: "{a: 1, b: az}", dsl_data: "main: { _map: {} }"}).fails()).toEqual(true)})

        })

    describe("1 entry map : ", function() {

        it("accept a simple matching map",
            function() { expect( parse({src_data: "{toto: 1}", dsl_data: "main: { _map: {toto: int} }"}).result().value["toto"].value).toEqual(1)})

        it("reject if no entry (empty map)",
            function() { expect( parse({src_data: "{}", dsl_data: "main: { _map: { toto: int} }"}).fails()).toEqual(true)})

        it("reject if bad entry",
            function() { expect( parse({src_data: "{titi: 1}", dsl_data: "main: { _map: { toto: int} }"}).fails()).toEqual(true)})

        it("reject if to many entries",
            function() { expect( parse({src_data: "{toto: 1, titi: 1}", dsl_data: "main: { _map: { toto: int} }"}).fails()).toEqual(true)})

        it("reject if null value",
            function() { expect( parse({src_data: "{toto: ~}", dsl_data: "main: { _map: { toto: int} }"}).fails()).toEqual(true)})

        it("reject if value does not match (float instead of int)",
            function() { expect( parse({src_data: "{toto: 1.1, titi: 1}", dsl_data: "main: { _map: { toto: int} }"}).fails()).toEqual(true)})

        it("reject if value does not match (string instead of int)",
            function() { expect( parse({src_data: "{toto: titi}", dsl_data: "main: { _map: { toto: int} }"}).fails()).toEqual(true)})

        it("reject if value does not match (boolean instead of int)",
            function() { expect( parse({src_data: "{toto: boolean}", dsl_data: "main: { _map: { toto: int} }"}).fails()).toEqual(true)})

        it("reject if value does not match (map instead of int)",
            function() { expect( parse({src_data: "{toto: {toto: 1}}", dsl_data: "main: { _map: { toto: int} }"}).fails()).toEqual(true)})

        it("reject if value does not match (list instead of int)",
            function() { expect( parse({src_data: "{toto: {toto: 1}}", dsl_data: "main: { _map: { toto: int} }"}).fails()).toEqual(true)})

        it("reject if not map (int)",
            function() { expect( parse({src_data: "12", dsl_data: "main: { _map: { toto: int} }"}).fails()).toEqual(true)})

        it("reject if not map (string)",
            function() { expect( parse({src_data: "toto", dsl_data: "main: { _map: { toto: int} }"}).fails()).toEqual(true)})

        it("reject if not map : boolean",
            function() { expect( parse({src_data: "true", dsl_data: "main: { _map: { toto: int} }"}).fails()).toEqual(true)})

        it("reject if not map : list",
            function() { expect( parse({src_data: "[toto, 1]", dsl_data: "main: { _map: { toto: int} }"}).fails()).toEqual(true)})

        it("fail if same entry two times",
            function() { expect( parse({src_data: '{ toto: 1, toto: 3 }', dsl_data: "main: { _map: {toto: int} }"}).fails()).toEqual(true)})


    })

    describe("several entries map : ", function() {

        it("accept a simple matching map",
            function() { expect( parse({src_data: "{ toto: 1, tutu: [ ed], titi: false }", dsl_data: "main: { _map: {toto: int, tutu: {_listOf: string}, titi: boolean } }"}).result().value["toto"].value).toEqual(1)})

        it("accept a simple matching map, in another order",
            function() { expect( parse({src_data: "{ tutu: [ ed], titi: false, toto: 1 }", dsl_data: "main: { _map: {toto: int, tutu: {_listOf: string}, titi: boolean } }"}).result().value["toto"].value).toEqual(1)})

        it("reject if no entry (empty map)",
            function() { expect( parse({src_data: "{}", dsl_data: "main: { _map: {toto: int, tutu: {_listOf: string}, titi: boolean } }"}).fails()).toEqual(true)})

        it("reject if bad entry",
            function() { expect( parse({src_data: "{toto: 1, tutu: [ ed], titi: 2 }", dsl_data: "main: { _map: {toto: int, tutu: {_listOf: string}, titi: boolean } }"}).fails()).toEqual(true)})

        it("reject if to many entries",
            function() { expect( parse({src_data: "{toto: 1, tutu: [ ed], titi: false, tata: 1 }", dsl_data: "main: { _map: {toto: int, tutu: {_listOf: string}, titi: boolean } }"}).fails()).toEqual(true)})

        it("reject if null value",
            function() { expect( parse({src_data: "{toto: ~, tutu: [ ed], titi: false}", dsl_data: "main: { _map: {toto: int, tutu: {_listOf: string}, titi: boolean } }"}).fails()).toEqual(true)})

        it("reject if one value does not match (float instead of int)",
            function() { expect( parse({src_data: "{toto: 1.1 , tutu: [ ed], titi: false}", dsl_data: "main: { _map: {toto: int, tutu: {_listOf: string}, titi: boolean } }"}).fails()).toEqual(true)})

        it("reject if not map (int)",
            function() { expect( parse({src_data: "12", dsl_data: "main: { _map: {toto: int, tutu: {_listOf: string}, titi: boolean } }"}).fails()).toEqual(true)})

        it("reject if not map (string)",
            function() { expect( parse({src_data: "toto", dsl_data: "main: { _map: {toto: int, tutu: {_listOf: string}, titi: boolean } }"}).fails()).toEqual(true)})

        it("reject if not map : boolean",
            function() { expect( parse({src_data: "true", dsl_data: "main: { _map: {toto: int, tutu: {_listOf: string}, titi: boolean } }"}).fails()).toEqual(true)})

        it("reject if not map : list",
            function() { expect( parse({src_data: "[toto, 1]", dsl_data: "main: { _map: {toto: int, tutu: {_listOf: string}, titi: boolean } }"}).fails()).toEqual(true)})

    })

    
    describe("'_mapOf' maps : ", function() {

        it("accept a lot of string maps",
            function() { expect( parse({src_data: "{ a: va, b: toto, c: tu tu, d: il, e: est, f: content }", dsl_data: "main: { _mapOf: string }"}).result().length()).toEqual(6)})
 
        it("accept a map of one element",
            function() { expect( parse({src_data: "{ toto: va }", dsl_data: "main: { _mapOf: string }"}).result().length()).toEqual(1)})

        it("accept the empy map",
            function() { expect( parse({src_data: "{}", dsl_data: "main: { _mapOf: string }"}).result().length()).toEqual(0)})

        it("reject if an map entry does not match",
            function() { expect( parse({src_data: "{ toto: va, tutu : 1, de: de }", dsl_data: "main: { _mapOf: string }"}).fails()).toEqual(true)})

        it("reject if an entry does not match 2",
            function() { expect( parse({src_data: "{ toto: [ 4, 12 ], tu: tu}", dsl_data: "main: { _mapOf: string }"}).fails()).toEqual(true)})

        it("reject if not map : int",
            function() { expect( parse({src_data: "12", dsl_data: "main: { _mapOf: string }"}).fails()).toEqual(true)})

        it("reject if not map : boolean",
            function() { expect( parse({src_data: "true", dsl_data: "main: { _mapOf: string }"}).fails()).toEqual(true)})

        it("reject if not map : boolean",
            function() { expect( parse({src_data: "true", dsl_data: "main: { _mapOf: string }"}).fails()).toEqual(true)})

        it("reject if not map : string",
            function() { expect( parse({src_data: '"[ va, 4 ]"', dsl_data: "main: { _mapOf: string }"}).fails()).toEqual(true)})

        it("fail if same entry two times",
            function() { expect( parse({src_data: '{ a: toto, a: tutu }', dsl_data: "main: { _mapOf: string }"}).fails()).toEqual(true)})
        
    })

    
    describe("'_mapFacultative' map : ", function() {
        it("accept a simple map of 3 element of 3",
            function() { expect( parse({src_data: "{ a: va, b: 4, c: false }", dsl_data: "main: { _mapFacultative: { a: string, b: int, c: boolean } }"}).result().length()).toEqual(3)})

        it("accept a simple map of 2 element of 3",
            function() { expect( parse({src_data: "{ a: va, b: 4 }", dsl_data: "main: { _mapFacultative: { a: string, b: int, c: boolean } }"}).result().length()).toEqual(2)})

        it("accept a simple 1 element of 3",
            function() { expect( parse({src_data: "{ a: va }", dsl_data: "main: { _mapFacultative: { a: string, b: int, c: boolean } }"}).result().length()).toEqual(1)})

        it("accept empty map",
            function() { expect( parse({src_data: "{ }", dsl_data: "main: { _mapFacultative: { a: string, b: int, c: boolean } }"}).result().length()).toEqual(0)})

        it("reject if no match",
            function() { expect( parse({src_data: "{ b: 4.12 }", dsl_data: "main: { _mapFacultative: { a: string, b: int, c: boolean } }"}).fails()).toEqual(true)})

        it("reject if too many elements",
            function() { expect( parse({src_data: "{ a: va, b: 4, c: true, d: 3 }", dsl_data: "main: { _mapFacultative: { a: string, b: int, c: boolean } }"}).fails()).toEqual(true)})

        it("reject if not map : list",
            function() { expect( parse({src_data: "[]", dsl_data: "main: { _mapFacultative: { a: string, b: int, c: boolean } }"}).fails()).toEqual(true)})

        it("reject if not list : int",
            function() { expect( parse({src_data: "12", dsl_data: "main: { _mapFacultative: { a: string, b: int, c: boolean } }"}).fails()).toEqual(true)})

        it("reject if not list : boolean",
            function() { expect( parse({src_data: "true", dsl_data: "main: { _mapFacultative: { a: string, b: int, c: boolean } }"}).fails()).toEqual(true)})

        it("reject if not list : string",
            function() { expect( parse({src_data: '"{ a: va, b: 4 }"', dsl_data: "main: { _mapFacultative: { a: string, b: int, c: boolean } }"}).fails()).toEqual(true)})
    })

    
    describe("multi-keyword map : ", function() {

        it("accept a map with only mandatory elements",
            function() { expect( parse({src_data: "{ a: 5, b: va }", dsl_data: "main: { _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).result().length()).toEqual(2)})

        it("accept a map with mandatory elements and some facultative ones",
            function() { expect( parse({src_data: "{ a: 5, b: va, d: true }", dsl_data: "main: { _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).result().length()).toEqual(3)})

        it("accept a map with mandatory elements and some floats",
            function() { expect( parse({src_data: "{ a: 5, b: va, e: 3.4, f: 5.3 }", dsl_data: "main: { _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).result().length()).toEqual(4)})

        it("reject a map with mandatory of facultative elements with type of complementary elements",
            function() { expect( parse({src_data: "{ a: 5, b: va, e: 3.4, c: 5.3 }", dsl_data: "main: { _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).fails()).toEqual(true)})

        it("accept a map with mandatory elements, some facultative and some floats",
            function() { expect( parse({src_data: "{ a: 5, b: va, c: toto, e: 3.4, f: 5.3 }", dsl_data: "main: { _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).result().length()).toEqual(5)})

        it("reject if all mandatory elements are not present in the map",
            function() { expect( parse({src_data: "{ a: 5, c: tr, r: 3.4, f: 5.3 }", dsl_data: "main: { _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).fails()).toEqual(true)})

        it("reject if some elements do not match",
            function() { expect( parse({src_data: "{ a: 5, b: va, r: 3.4, u: true }", dsl_data: "main: { _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).fails()).toEqual(true)})
            
    })

    
    describe("lists with sizing checkers: ", function() {

        it("accept a list with exactly 4 elements",
            function() { expect( parse({src_data: "{ a: 5, b: va, c: toto, e: 3.4 }", dsl_data: "main: { _nb: 4, _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).result().length()).toEqual(4)})

        it("reject if not exactly 4 elements (less)",
            function() { expect( parse({src_data: "{ a: 5, b: va, c: toto }", dsl_data: "main: { _nb: 4, _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).fails()).toEqual(true)})

        it("reject if not exactly 4 elements (more)",
            function() { expect( parse({src_data: "{ a: 5, b: va, c: toto, e: 3.4, f: 5.3 }", dsl_data: "main: { _nb: 4, _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).fails()).toEqual(true)})

        it("accept a map with 4 elements if at least 3 are required",
            function() { expect( parse({src_data: "{ a: 5, b: va, c: toto, e: 3.4 }", dsl_data: "main: { _min: 3, _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).result().length()).toEqual(4)})

        it("accept a map with 3 elements  if at least 3 are required",
            function() { expect( parse({src_data: "{ a: 5, b: va, c: toto }", dsl_data: "main: { _min: 3, _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).result().length()).toEqual(3)})

        it("reject a map with 2 elements  if at least 3 are required",
            function() { expect( parse({src_data: "{ a: 5, b: va }", dsl_data: "main: { _min: 3, _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).fails()).toEqual(true)})

        it("accept a map with 2 elements if no more than 3 are allowed",
            function() { expect( parse({src_data: "{ a: 5, b: va }", dsl_data: "main: { _max: 3, _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).result().length()).toEqual(2)})

        it("accept a map with 3 elements if no more than 3 are allowed",
            function() { expect( parse({src_data: "{ a: 5, b: va, c: toto }", dsl_data: "main: { _max: 3, _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).result().length()).toEqual(3)})

        it("reject a map with 4 elements if no more than 3 are allowed",
            function() { expect( parse({src_data: "{ a: 5, b: va, c: toto, e: 3.4 }", dsl_data: "main: { _max: 3, _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).fails()).toEqual(true)})

        it("accept a map with a number of element between _min and max",
            function() { expect( parse({src_data: "{ a: 5, b: va }", dsl_data: "main: { _min: 1, _max: 3, _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).success()).toEqual(true)})

        it("accept a map with good number of element if _min == max",
            function() { expect( parse({src_data: "{ a: 5, b: va }", dsl_data: "main: { _min: 2, _max: 2, _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).success()).toEqual(true)})

        it("reject a map with more than _max elements even if _min exists",
            function() { expect( parse({src_data: "{ a: 5, b: va, c: toto }", dsl_data: "main: { _min: 1, _max: 2, _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).fails()).toEqual(true)})

        it("reject  a map with less than _in elements even if _max exists",
            function() { expect( parse({src_data: "{ a: 5, b: va }", dsl_data: "main: { _min: 3, _max: 4, _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).fails()).toEqual(true)})

        it("reject if _min > _max",
            function() { expect( parse({src_data: "{ a: 5, b: va, c: toto }", dsl_data: "main: { _max: 2, _min: 3, _map: { a: int, b: string}, _mapFacultative: { c: string, d: boolean }, _mapOf: float }"}).fails()).toEqual(true)})

    })

})
