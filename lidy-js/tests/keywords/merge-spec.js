import { parse } from '../../parser/parse.js'

describe("Merge expressions ->", function() {

    describe("simple merge : ", function() {

        it("merge two simple merges",
            function() { expect( parse({src_data: "{ a: 2, b: 3 }", dsl_data: "main: { _merge: [  {_map: { a: int}}, {_map: { b: int}} ]  }"}).result().value["b"].value).toEqual(3)})

        it("merge one map two another one",
            function() { expect( parse({src_data: "{ a: 2, b: 3 }", dsl_data: "main: { _map: { a: int}, _merge: [ {_map: { b: int}} ]  }"}).result().value["b"].value).toEqual(3)})

        it("merge of merge",
            function() { expect( parse({src_data: "{ a: 2, b: 3, c: true }", dsl_data: "main: { _map: { a: int}, _merge: [ {_map: { b: int}, _merge: [ { _map: { c: boolean} } ] } ]  }"}).result().value["b"].value).toEqual(3)})

        it("merge with oneOf",
            function() { expect( parse({src_data: "{ a: 2, b: 3, c: true }", dsl_data: "main: { _map: { a: int, b: int}, _merge: [ {_oneOf: [{_map: { c: int}}, {_map: { c: boolean}} ] } ] }"}).result().value["c"].value).toEqual(true)})
    })
})

