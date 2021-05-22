import { parse } from '../../parser/parse.js'

describe("List expressions ->", function() {

    describe("empty list : ", function() {

        it("accept empty list",
            function() { expect( parse({src_data: "[ ]", dsl_data: "main: { _list: [] }"}).contents.getChild(0).value.length).toEqual(0)})

        it("reject non empty list (of one integer)",
            function() { expect( parse({src_data: "[ 4 ]", dsl_data: "main: { _list: [] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject non empty list (of one null element)",
            function() { expect( parse({src_data: "[ ~ ]", dsl_data: "main: { _list: [] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject non empty list (of several elements)",
            function() { expect( parse({src_data: "[ 1, a ]", dsl_data: "main: { _list: [] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        })

    describe("2 entries list : ", function() {

        it("accept a simple list of 2 elements",
            function() { expect( parse({src_data: "[ va, 4 ]", dsl_data: "main: { _list: [ string, integer ] }"}).contents.getChild(0).value.length).toEqual(2)})

        it("reject if an entry does not match",
            function() { expect( parse({src_data: "[ va, bv ]", dsl_data: "main: { _list: [ string, integer ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if an entry does not match 2",
            function() { expect( parse({src_data: "[ 4, 12 ]", dsl_data: "main: { _list: [ string, integer ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if an entry does not match 2",
            function() { expect( parse({src_data: "[ 4, va ]", dsl_data: "main: { _list: [ string, integer ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if too many elements",
            function() { expect( parse({src_data: "[ va, 4, vb ]", dsl_data: "main: { _list: [ string, integer ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not enough elements",
            function() { expect( parse({src_data: "[ va ]", dsl_data: "main: { _list: [ string, integer ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not list : map",
            function() { expect( parse({src_data: "{}", dsl_data: "main: { _list: [ string, integer ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not list : int",
            function() { expect( parse({src_data: "12", dsl_data: "main: { _list: [ string, integer ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not list : boolean",
            function() { expect( parse({src_data: "true", dsl_data: "main: { _list: [ string, integer ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not list : boolean",
            function() { expect( parse({src_data: "true", dsl_data: "main: { _list: [ string, integer ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not list : string",
            function() { expect( parse({src_data: '"[ va, 4 ]"', dsl_data: "main: { _list: [ string, integer ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

    })

    describe("'_listOf' lists : ", function() {

        it("accept a lot of strings",
            function() { expect( parse({src_data: "[ va, toto, tu tu, il, est, content ]", dsl_data: "main: { _listOf: string }"}).contents.getChild(0).value.length).toEqual(6)})

        it("accept a list of one string",
            function() { expect( parse({src_data: "[ va ]", dsl_data: "main: { _listOf: string }"}).contents.getChild(0).value.length).toEqual(1)})

        it("accept the empy string",
            function() { expect( parse({src_data: "[ ]", dsl_data: "main: { _listOf: string }"}).contents.getChild(0).value.length).toEqual(0)})

        it("reject if an entry does not match",
            function() { expect( parse({src_data: "[ va, bv, de, de, frf, true ]", dsl_data: "main: { _listOf: string }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if an entry does not match 2",
            function() { expect( parse({src_data: "[ 4, 12 ]", dsl_data: "main: { _listOf: string }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if an entry does not match 2",
            function() { expect( parse({src_data: "[ [4, 6], va ]", dsl_data: "main: { _listOf: string }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not list : map",
            function() { expect( parse({src_data: "{}", dsl_data: "main: { _listOf: string }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not list : int",
            function() { expect( parse({src_data: "12", dsl_data: "main: { _listOf: string }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not list : boolean",
            function() { expect( parse({src_data: "true", dsl_data: "main: { _listOf: string }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not list : boolean",
            function() { expect( parse({src_data: "true", dsl_data: "main: { _listOf: string }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not list : string",
            function() { expect( parse({src_data: '"[ va, 4 ]"', dsl_data: "main: { _listOf: string }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

    })

    describe("'_listFacultative' lists : ", function() {
        it("accept a simple list of 3 element of 3",
            function() { expect( parse({src_data: "[ va, 4, false ]", dsl_data: "main: { _listFacultative: [ string, integer, boolean ] }"}).contents.getChild(0).value.length).toEqual(3)})

        it("accept a simple list of 2 element of 3",
            function() { expect( parse({src_data: "[ va, 4 ]", dsl_data: "main: { _listFacultative: [ string, integer, boolean ] }"}).contents.getChild(0).value.length).toEqual(2)})

        it("accept a simple list of first element of 3",
            function() { expect( parse({src_data: "[ va ]", dsl_data: "main: { _listFacultative: [ string, integer, boolean ] }"}).contents.getChild(0).value.length).toEqual(1)})

        it("accept a simple list of only the second element of 3",
            function() { expect( parse({src_data: "[ 4 ]", dsl_data: "main: { _listFacultative: [ string, integer, boolean ] }"}).contents.getChild(0).value.length).toEqual(1)})

        it("accept empty list",
            function() { expect( parse({src_data: "[ ]", dsl_data: "main: { _listFacultative: [ string, integer, boolean ] }"}).contents.getChild(0).value.length).toEqual(0)})

        it("accept a simple list of only the second and third elements of 3",
            function() { expect( parse({src_data: "[ 4, true ]", dsl_data: "main: { _listFacultative: [ string, integer, boolean ] }"}).contents.getChild(0).value.length).toEqual(2)})

        it("reject if elements are not in good order",
            function() { expect( parse({src_data: "[ 4, va ]", dsl_data: "main: { _listFacultative: [ string, integer, boolean ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if no match",
            function() { expect( parse({src_data: "[ 4.12 ]", dsl_data: "main: { _listFacultative: [ string, integer, boolean ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if too many elements",
            function() { expect( parse({src_data: "[ va, 4, true, 3 ]", dsl_data: "main: { _listFacultative: [ string, integer, boolean ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not list : map",
            function() { expect( parse({src_data: "{}", dsl_data: "main: { _listFacultative: [ string, integer, boolean ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not list : int",
            function() { expect( parse({src_data: "12", dsl_data: "main: { _listFacultative: [ string, integer, boolean ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not list : boolean",
            function() { expect( parse({src_data: "true", dsl_data: "main: { _listFacultative: [ string, integer, boolean ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not list : boolean",
            function() { expect( parse({src_data: "true", dsl_data: "main: { _listFacultative: [ string, integer, boolean ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not list : string",
            function() { expect( parse({src_data: '"[ va, 4 ]"', dsl_data: "main: { _listFacultative: [ string, integer, boolean ] }"}).errors[0].name).toEqual('SYNTAX_ERROR')})
    })


    describe("multi-keyword lists : ", function() {

        it("accept a list with only mandatory elements",
            function() { expect( parse({src_data: "[ 5, va ]", dsl_data: "main: { _list: [integer, string], _listFacultative: [ string, integer, boolean ], _listOf: float }"}).contents.getChild(0).value.length).toEqual(2)})

        it("accept a list with mandatory elements and some facultative ones",
            function() { expect( parse({src_data: "[ 5, va, 5, true ]", dsl_data: "main: { _list: [integer, string], _listFacultative: [ string, integer, boolean ], _listOf: float }"}).contents.getChild(0).value.length).toEqual(4)})

        it("accept a list with mandatory elements and some floats",
            function() { expect( parse({src_data: "[ 5, va, 3.4, 5.3 ]", dsl_data: "main: { _list: [integer, string], _listFacultative: [ string, integer, boolean ], _listOf: float }"}).contents.getChild(0).value.length).toEqual(4)})

        it("accept a list with mandatory elements, some facultative and some floats",
            function() { expect( parse({src_data: "[ 5, va, true, 3.4, 5.3 ]", dsl_data: "main: { _list: [integer, string], _listFacultative: [ string, integer, boolean ], _listOf: float }"}).contents.getChild(0).value.length).toEqual(5)})

        it("reject if all mandatory elements are not present at the begining of the list",
            function() { expect( parse({src_data: "[ 5, true, 3.4, 5.3 ]", dsl_data: "main: { _list: [integer, string], _listFacultative: [ string, integer, boolean ], _listOf: float }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if some completing elements are before facultative",
            function() { expect( parse({src_data: "[ 5, va, 3.4, true ]", dsl_data: "main: { _list: [integer, string], _listFacultative: [ string, integer, boolean ], _listOf: float }"}).errors[0].name).toEqual('SYNTAX_ERROR')})
            
    })

    describe("lists with sizing checkers: ", function() {

        it("accept a list with exactly 4 elements",
            function() { expect( parse({src_data: "[ 5, va, vb, 4.3 ]", dsl_data: "main: { _nb: 4, _list: [integer, string], _listFacultative: [ string, integer, boolean ], _listOf: float }"}).contents.getChild(0).value.length).toEqual(4)})

        it("reject if not exactly 4 elements (less)",
            function() { expect( parse({src_data: "[ 5, va, vb ]", dsl_data: "main: { _nb: 4, _list: [integer, string], _listFacultative: [ string, integer, boolean ], _listOf: float }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("reject if not exactly 4 elements (more)",
            function() { expect( parse({src_data: "[ 5, va, vb, 4.3, 1.2 ]", dsl_data: "main: { _nb: 4, _list: [integer, string], _listFacultative: [ string, integer, boolean ], _listOf: float }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("accept a list with 4 elements if at least 3 are required",
            function() { expect( parse({src_data: "[ 5, va, vb, 4.3 ]", dsl_data: "main: { _min: 3, _list: [integer, string], _listFacultative: [ string, integer, boolean ], _listOf: float }"}).contents.getChild(0).value.length).toEqual(4)})

        it("accept a list with 3 elements  if at least 3 are required",
            function() { expect( parse({src_data: "[ 5, va, vb ]", dsl_data: "main: { _min: 3, _list: [integer, string], _listFacultative: [ string, integer, boolean ], _listOf: float }"}).contents.getChild(0).value.length).toEqual(3)})

        it("reject a list with 2 elements  if at least 3 are required",
            function() { expect( parse({src_data: "[ 5, va ]", dsl_data: "main: { _min: 3, _list: [integer, string], _listFacultative: [ string, integer, boolean ], _listOf: float }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        it("accept a list with 2 elements if no more than 3 are allowed",
            function() { expect( parse({src_data: "[ 5, va ]", dsl_data: "main: { _max: 3, _list: [integer, string], _listFacultative: [ string, integer, boolean ], _listOf: float }"}).contents.getChild(0).value.length).toEqual(2)})

        it("accept a list with 3 elements if no more than 3 are allowed",
            function() { expect( parse({src_data: "[ 5, va, vb ]", dsl_data: "main: { _max: 3, _list: [integer, string], _listFacultative: [ string, integer, boolean ], _listOf: float }"}).contents.getChild(0).value.length).toEqual(3)})

        it("reject a list with 4 elements if no more than 3 are allowed",
            function() { expect( parse({src_data: "[ 5, va, vb, 4.3 ]", dsl_data: "main: { _max: 3, _list: [integer, string], _listFacultative: [ string, integer, boolean ], _listOf: float }"}).errors[0].name).toEqual('SYNTAX_ERROR')})

        })
})
