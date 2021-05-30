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

        it("merge through a rule-name",
            function() { expect( parse({src_data: "{ r: 5 }", dsl_data: "{ main: { _merge: [ reference ] }, reference: { _map: {r: int} } }"}).result().value["r"].value).toEqual(5)})

        it("merge through a rule-name applied on a map",
            function() { expect( parse({src_data: "{ r: 5, a: true}", dsl_data: "{ main: { _map: { a: boolean }, _merge: [ reference ] }, reference: { _map: {r: int} } }"}).result().value["r"].value).toEqual(5)})

        it("merge through a rule-name and oneOf applied on a map",
            function() { expect( parse({src_data: "{ r: 5, a: true, c: 1.2 }", dsl_data: "{ main: { _map: { a: boolean }, _merge: [ reference, { _oneOf: [ _mapOf: { string: string }, { _map: { c: float } } ] } ] }, reference: { _map: {r: int} } }"}).result().value["r"].value).toEqual(5)})

    })
})

