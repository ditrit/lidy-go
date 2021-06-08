import { parse } from '../../parser/parse.js'

describe("Test real grammars ->", function() {

    it("check lidy's grammar",
        function() { expect( parse({src_file: "../../schemas/schema.lidy.yaml", dsl_file: '../../schemas/schema.lidy.yaml'}).success()).toEqual(true)})

    it("check tosca grammar",
        function() { expect( parse({src_file: '../../schemas/schema.tosca.yaml', dsl_file: '../../schemas/schema.lidy.yaml'}).success()).toEqual(true)})
    
    })


