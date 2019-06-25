basedir=process.cwd()

app = require(basedir + '/index.js')

describe("Tosca Grammar ->", function() {

    describe("service_template : ", function() {

        it("The compiler should load main file of TOSCA normative types using TOSCA grammar",
                function() { expect(  app.parse_file('tests/tosca_types.yaml', 'tests/tosca_definition.yaml', 'service_template') ) 
        })
    })

})
