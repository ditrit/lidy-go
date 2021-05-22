import { parse } from '../../parser/parse.js'

describe("Regular expressions ->", function() {

    describe("email detection : ", function() {
        it("accept email 1",
            function() { expect( parse({src_data: "a.b@0.com.de", dsl_data: 'main: { _regex: "^[a-zA-Z0-9]+([.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.][a-zA-Z0-9]+)+$" }'}).contents.getChild(0).value).toEqual("a.b@0.com.de")})

        it("accept email 2",
            function() { expect( parse({src_data: "a@o.de", dsl_data: 'main: { _regex: "^[a-zA-Z0-9]+([.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.][a-zA-Z0-9]+)+$" }'}).contents.getChild(0).value).toEqual("a@o.de")})

        it("reject email 1",
            function() { expect( parse({src_data: ".a.b@0.com.de", dsl_data: 'main: { _regex: "^[a-zA-Z0-9]+([.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.][a-zA-Z0-9]+)+$" }'}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject email 2",
            function() { expect( parse({src_data: "a@de", dsl_data: 'main: { _regex: "^[a-zA-Z0-9]+([.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.][a-zA-Z0-9]+)+$" }'}).errors[0].name).toEqual('SYNTAX_ERROR')})
    })

    describe("regex empty", function() {

        it("accept empty string",
            function() { expect( parse({src_data: '""', dsl_data: 'main: { _regex: "^$" }'}).contents.getChild(0).value).toEqual("")})

        it("reject letter",
            function() { expect( parse({src_data: "a", dsl_data: 'main: { _regex: "^$" }'}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject space",
            function() { expect( parse({src_data: '" "', dsl_data: 'main: { _regex: "^$" }'}).errors[0].name).toEqual('SYNTAX_ERROR')})
        })

        describe("regex non-empty word", function() {

        it("accept non-empty word",
            function() { expect( parse({src_data: "a", dsl_data: 'main: { _regex: "[a-z]+" }'}).contents.getChild(0).value).toEqual("a")})
            
        it("accept non-empty word 2",
            function() { expect( parse({src_data: "word", dsl_data: 'main: { _regex: "[a-z]+" }'}).contents.getChild(0).value).toEqual("word")})

        it("reject if not a string : integer",
            function() { expect( parse({src_data: "123", dsl_data: 'main: { _regex: "[a-z]+" }'}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not a string : float",
            function() { expect( parse({src_data: "12.3", dsl_data: 'main: { _regex: "[a-z]+" }'}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not a string : list",
            function() { expect( parse({src_data: "[]", dsl_data: 'main: { _regex: "[a-z]+" }'}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not a string : null",
            function() { expect( parse({src_data: "~", dsl_data: 'main: { _regex: "[a-z]+" }'}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not a string : boolean",
            function() { expect( parse({src_data: "true", dsl_data: 'main: { _regex: "[a-z]+" }'}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not a string : map",
            function() { expect( parse({src_data: "{}", dsl_data: 'main: { _regex: "[a-z]+" }'}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject empty string",
            function() { expect( parse({src_data: '""', dsl_data: 'main: { _regex: "[a-z]+" }'}).errors[0].name).toEqual('SYNTAX_ERROR')})


        })
})
