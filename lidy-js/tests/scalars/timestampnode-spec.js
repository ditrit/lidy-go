import { parse } from '../../parser/node_parse.js'

describe("Lidy scalars ->", function() {

    describe("timestamp scalar : ", function() {
        it("date (00:00:00Z)",
            function() { expect( parse({src_data: "2021-02-12", dsl_data: "main: timestamp"}).result().value).toEqual(new Date("2021-02-12"))})

        it("canonical",
            function() { expect( parse({src_data: "2001-12-15T02:59:43.1Z", dsl_data: "main: timestamp"}).result().value).toEqual(new Date("2001-12-15 03:59:43.1 GMT+0100"))})

        it("valid iso8601",
            function() { expect( parse({src_data: "2001-12-14t21:59:43.10-04:00", dsl_data: "main: timestamp"}).result().value).toEqual(new Date("2001-12-15 02:59:43.1 GMT+0100"))})

        it("space separated",
            function() { expect( parse({src_data: "2001-12-14 21:59:43.10 -4", dsl_data: "main: timestamp"}).result().value).toEqual(new Date("2001-12-15 02:59:43.1 GMT+0100"))})

        it("no time zone (Z)",
            function() { expect( parse({src_data: "2001-12-15 2:59:43.10", dsl_data: "main: timestamp"}).result().value).toEqual(new Date("2001-12-15 02:59:43.1 GMT+0100"))})

        it("float is not a timestamp",
            function() { expect( parse({src_data: "2001.12", dsl_data: "main: timestamp"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("string is not an int (if not respecting iso8601 format)",
            function() { expect( parse({src_data: "2001/12/15", dsl_data: "main: int"}).errors[0].name).toEqual('SYNTAX_ERROR')})

    })
})
