import { parse } from '../../parser/parse.js'

describe("Lidy scalars ->", function() {

    describe("int scalar : ", function() {
        
        it("positive int",
            function() { expect( parse({src_data: "2123", dsl_data: "main: int"}).result().value).toEqual(2123)})

        it("nagative int",
            function() { expect( parse({src_data: "-2123", dsl_data: "main: int"}).result().value).toEqual(-2123)})

        it("zero",
            function() { expect( parse({src_data: "0", dsl_data: "main: int"}).result().value).toEqual(0)})

        it("huge int",
            function() { expect( parse({src_data: "618468416534168546835413658486413415863486468593469384136551365142638954634135413646894", dsl_data: "main: int"}).result().value).toEqual(618468416534168546835413658486413415863486468593469384136551365142638954634135413646894)})

        it("float is not int",
            function() { expect( parse({src_data: "1.4", dsl_data: "main: int"}).fails()).toEqual(true)})

        it("string is not an int",
            function() { expect( parse({src_data: "7000 F", dsl_data: "main: int"}).fails()).toEqual(true)})

        it("an int wrote as an int is an int", 
            function() { expect( parse({src_data: "7.000", dsl_data: "main: int"}).result().value).toEqual(7)})

        it("a list is not a negative int...",
            function() { expect( parse({src_data: "- 7000 F", dsl_data: "main: int"}).fails()).toEqual(true)})

        it("a map is not an int",
            function() { expect( parse({src_data: "{12: 7000}", dsl_data: "main: int"}).fails()).toEqual(true)})

    })
})
