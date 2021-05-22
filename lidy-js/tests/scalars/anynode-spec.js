import { parse } from '../../parser/parse.js'

describe("Lidy scalars ->", function() {

    describe("any scalar : ", function() {

        it("A string value",
            function() { expect( parse({src_data: "tagada", dsl_data: "main: any"}).contents.getChild(0).value).toEqual('tagada')})

        it("A number value",
            function() { expect( parse({src_data: "12.5", dsl_data: "main: any"}).contents.getChild(0).value).toEqual(12.5)})

        it("A boolean value",
            function() { expect( parse({src_data: "true", dsl_data: "main: any"}).contents.getChild(0).value).toEqual(true)})

        it("A map value",
            function() { expect( parse({src_data: "{ un: 1, deux: 2 }", dsl_data: "main: any"}).contents.getChild(0).value["un"].value).toEqual(1)})

        it("A list value",
            function() { expect( parse({src_data: '[ un, 1, deux, null, 2 ]', dsl_data: "main: any"}).contents.getChild(0).value[4].value).toEqual(2)})

        it("A null value",
            function() { expect( parse({src_data: '~', dsl_data: "main: any"}).contents.getChild(0).value).toEqual(null)})

        it("complex type",
            function() { expect( parse({src_data: "{ un: [1, { un: '1' } ], deux: 2 }", dsl_data: "main: any"}).contents.getChild(0).value["un"].value[1].value["un"].value).toEqual('1')})

        it("values that could be strings or something else (timestamp or base64) are parsed as strings by 'any'",
            function() { expect( parse({src_data: "2021-01-12", dsl_data: "main: any"}).contents.getChild(0).value).toEqual("2021-01-12")})

    })

})
