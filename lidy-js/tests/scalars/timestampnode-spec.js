import { parse } from '../../parse.js'

describe("Lidy scalars ->", function() {

    describe("timestamp scalar : ", function() {
        it("A simple timestamp",
            function() { expect( parse({src_data: "2021-02-12", dsl_data: "main: timestamp"}).contents.getChild(0).value).toEqual(new Date("2021-02-12"))})
        })


})
