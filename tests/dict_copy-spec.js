basedir=process.cwd()

app = require(basedir + '/index.js')

describe("_copy keyword test using a dedicated Grammar ->", function() {

    describe("_copy keyword : ", function() {

        it("The compiler should manage grammar rules that use the '_copy' fonctionnality",
                function() { expect(  app.parse_file('tests/test_dict_copy.yaml', 'tests/test_dict_copy_def.yaml', 'artifact_type') ) 
        })
    })

})

