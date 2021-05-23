import { parse } from '../../parser/parse.js'

describe("Lidy scalars ->", function() {

    describe("integer scalar : ", function() {
        
        it("positive integer",
            function() { expect( parse({src_data: "2123", dsl_data: "main: integer"}).result().value).toEqual(2123)})

        it("nagative integer",
            function() { expect( parse({src_data: "-2123", dsl_data: "main: integer"}).result().value).toEqual(-2123)})

        it("zero",
            function() { expect( parse({src_data: "0", dsl_data: "main: integer"}).result().value).toEqual(0)})

        it("huge integer",
            function() { expect( parse({src_data: "618468416534168546835413658486413415863486468593469384136551365142638954634135413646894", dsl_data: "main: integer"}).result().value).toEqual(618468416534168546835413658486413415863486468593469384136551365142638954634135413646894)})

        it("float is not integer",
            function() { expect( parse({src_data: "1.4", dsl_data: "main: integer"}).fails()).toEqual(true)})

        it("string is not an integer",
            function() { expect( parse({src_data: "7000 F", dsl_data: "main: integer"}).fails()).toEqual(true)})

        it("an integer wrote as an integer is an integer", 
            function() { expect( parse({src_data: "7.000", dsl_data: "main: integer"}).result().value).toEqual(7)})

        it("a list is not a negative integer...",
            function() { expect( parse({src_data: "- 7000 F", dsl_data: "main: integer"}).fails()).toEqual(true)})

        it("a map is not an integer",
            function() { expect( parse({src_data: "{12: 7000}", dsl_data: "main: integer"}).fails()).toEqual(true)})

    })
})
