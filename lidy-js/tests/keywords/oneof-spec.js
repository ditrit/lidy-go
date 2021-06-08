import { parse } from '../../parser/parse.js'

describe("Alternatives ->", function() {

    describe("simple alternative : ", function() {
        it("int or string",
            function() { expect( parse({src_data: "5", dsl_data: 'main: { _oneOf: [ int, string ] }'}).result().value).toEqual(5)})

        it("fail if not an alternative",
            function() { expect( parse({src_data: "true", dsl_data: 'main: { _oneOf: [ int, string ] }'}).fails())})

        it("fail if empty",
            function() { expect( parse({src_data: "~", dsl_data: 'main: { _oneOf: [ int, string ] }'}).fails())})

        it("alternative between map and lists",
            function() { expect( parse({src_data: "{titi: 1.2}", dsl_data: 'main: { _oneOf: [ { _mapOf: int }, { _listOf: string }, { _map: { titi: float } } ] }'}).success()).toEqual(true)})
    })
})
