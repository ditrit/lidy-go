import { parse } from '../../parser/parse.js'

describe("Lidy scalars ->", function() {

    describe("boolean scalar : ", function() {
        
        it("true",
            function() { expect( parse({src_data: "true", dsl_data: "main: boolean"}).contents.getChild(0).value).toEqual(true)})

        it("false",
            function() { expect( parse({src_data: "false", dsl_data: "main: boolean"}).contents.getChild(0).value).toEqual(false)})

        it("caps",
            function() { expect( parse({src_data: "FALSE", dsl_data: "main: boolean"}).contents.getChild(0).value).toEqual(false)})

        it("variant",
            function() { expect( parse({src_data: "True", dsl_data: "main: boolean"}).contents.getChild(0).value).toEqual(true)})

        it("integer is not boolean",
            function() { expect( parse({src_data: "0", dsl_data: "main: boolean"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("string is not a boolean",
            function() { expect( parse({src_data: '""', dsl_data: "main: boolean"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("empty list is not a boolean",
            function() { expect( parse({src_data: "[]", dsl_data: "main: boolean"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("a map is not a boolean",
            function() { expect( parse({src_data: "{}", dsl_data: "main: boolean"}).errors[0].name).toEqual('SYNTAX_ERROR')})

    })
})
