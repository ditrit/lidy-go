import { parse } from '../../parser/parse.js'

describe("Lidy scalars ->", function() {

    describe("null scalar : ", function() {
        
        it("null symbol",
            function() { expect( parse({src_data: "~", dsl_data: "main: null"}).contents.getChild(0).value).toEqual(null)})

        it("null value",
            function() { expect( parse({src_data: "null", dsl_data: "main: null"}).contents.getChild(0).value).toEqual(null)})

        it("integer is not null",
            function() { expect( parse({src_data: "0", dsl_data: "main: null"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("string is not null",
            function() { expect( parse({src_data: `"~ "`, dsl_data: "main: null"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("empty list is not null",
            function() { expect( parse({src_data: "[]", dsl_data: "main: null"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("empty map is not null",
            function() { expect( parse({src_data: "{}", dsl_data: "main: null"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("empty string is not null",
            function() { expect( parse({src_data: '""', dsl_data: "main: null"}).errors[0].name).toEqual('SYNTAX_ERROR')})

    })
})
