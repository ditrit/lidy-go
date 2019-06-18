basedir=process.cwd()

app = require(basedir + '/index.js')

describe("Tosca Grammar ->", function() {

    describe("metadata : ", function() {

        it("The compiler should accept simple metadata",
                function() { expect( app.parse_string(
`
  template_author: Xavier Talon
  template_name:   Un joli nom
`, 'tests/tosca_definition.yaml', 'metadata' ) ) 

        })
    })

})
