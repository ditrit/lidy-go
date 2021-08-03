import { parse } from '../../parser/node_parse.js'

describe("Possible values (_in) ->", function() {

    describe("simple alternative : ", function() {
        it("int or string",
            async function() { 
                const res = 
                expect( (await parse({src_data: "5", dsl_data: 'main: { _in: [ 3, 5, 7 ] }'})).result().value).toEqual(5)})

        it("multiple type of alternatives",
            function() { expect(  parse({src_data: "45", dsl_data: "main: { _in: [ 12, abcd, true, 45 ] }"}).result().value).toEqual(45)})

        it("fails if not in possible values",
            function() { expect( parse({src_data: "plouf", dsl_data: 'main: { _in: [ 45, plif, true ] }'}).fails())})

        it("fails if empty",
            function() { expect( parse({src_data: "~", dsl_data: 'main: { _in: [ 45, plif, true ] }'}).fails())})

        it("falis if not a scalar",
            function() { expect( parse({src_data: "{titi: 1.2}", dsl_data: 'main: { _in: [ 45, {titi: 1.2}, 23 ] }'}).fails())})

    })
})
