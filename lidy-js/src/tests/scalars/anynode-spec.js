import { parse } from '../../parser/node_parse.js'

describe("Lidy scalars ->", function() {

    describe("any scalar : ", function() {

        it("A string value",
            function() { expect( parse({src_data: "tagada", dsl_data: "main: any"}).result().value).toEqual('tagada')})

        it("A number value",
            function() { expect( parse({src_data: "12.5", dsl_data: "main: any"}).result().value).toEqual(12.5)})

        it("A boolean value, normative notation",
            function() { expect( parse({src_data: "false", dsl_data: "main: any"}).result().value).toEqual(false)})

        it("A boolean value, permissive notation",
        function() { expect( parse({src_data: "True", dsl_data: "main: any"}).result().value).toEqual(true)})

        it("A map value",
            function() { expect( parse({src_data: "{ un: 1, deux: 2 }", dsl_data: "main: any"}).result().value["un"].value).toEqual(1)})

        it("A list value",
            function() { expect( parse({src_data: '[ un, 1, deux, null, 2 ]', dsl_data: "main: any"}).result().value[4].value).toEqual(2)})

        it("A null value",
            function() { expect( parse({src_data: '~', dsl_data: "main: any"}).result().value).toEqual(null)})

        it("complex type",
            function() { expect( parse({src_data: "{ un: [1, { un: '1' } ], deux: 2 }", dsl_data: "main: any"}).result().value["un"].value[1].value["un"].value).toEqual('1')})

        it("values that could be strings or something else (timestamp or base64) are parsed as strings by 'any'",
            function() { expect( parse({src_data: "2021-01-12", dsl_data: "main: any"}).result().value).toEqual("2021-01-12")})

    })

})
