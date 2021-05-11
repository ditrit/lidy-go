import { parse } from '../parse.js'

describe("Lidy scalars ->", function() {

    describe("string scalar : ", function() {

        it("simple string",
            function() { expect(  parse({src_data: "tagada", dsl_data: "main: string"}).contents.getChild(0).value).toEqual('tagada') })

    })
})
