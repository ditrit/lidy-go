import { parse } from '../../parser/parse.js'

describe("Lidy scalars ->", function() {

    describe("integer scalar : ", function() {
        
        it("positive float",
            function() { expect( parse({src_data: "212.334453", dsl_data: "main: float"}).result().value).toEqual(212.334453)})

        it("nagative float",
            function() { expect( parse({src_data: "-212.334453", dsl_data: "main: float"}).result().value).toEqual(-212.334453)})

        it("zero",
            function() { expect( parse({src_data: "0.0", dsl_data: "main: float"}).result().value).toEqual(0)})

        it("huge float",
            function() { expect( parse({src_data: "6184684165341685468354136584864134158634864685934693841.36551365142638954634135413646894", dsl_data: "main: float"}).result().value).toEqual(6184684165341685468354136584864134158634864685934693841.36551365142638954634135413646894)})

        it("string is not a float",
            function() { expect( parse({src_data: "70.10 F", dsl_data: "main: float"}).fails()).toEqual(true)})

        it("an integer is a float", 
            function() { expect( parse({src_data: "7.000", dsl_data: "main: float"}).result().value).toEqual(7)})

        it("a list is not a negative float...",
            function() { expect( parse({src_data: "- 70.1", dsl_data: "main: float"}).fails()).toEqual(true)})

        it("a map is not an float",
            function() { expect( parse({src_data: "{12: 7000}", dsl_data: "main: float"}).fails()).toEqual(true)})

    })
})
