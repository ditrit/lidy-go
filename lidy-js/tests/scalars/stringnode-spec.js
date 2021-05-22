import { parse } from '../../parser/parse.js'

describe("Lidy scalars ->", function() {

    describe("string scalar : ", function() {

        it("simple plain string",
            function() { expect(  parse({src_data: "tagada", dsl_data: "main: string"}).contents.getChild(0).value).toEqual('tagada') })

        it("a multi words plain string",
            function() { expect(  parse({src_data: "tagada pouet pouet 2 fois", dsl_data: "main: string"}).contents.getChild(0).value).toEqual('tagada pouet pouet 2 fois') })

        it("a plain string begining with a number",
            function() { expect(  parse({src_data: "2 fois tagada pouet pouet", dsl_data: "main: string"}).contents.getChild(0).value).toEqual('2 fois tagada pouet pouet') })

        it("a default multi line plain string",
            function() { expect(  parse({src_data: `tagada 
pouet pouet 
  2 fois`, dsl_data: "main: string"}).contents.getChild(0).value).toEqual(`tagada pouet pouet 2 fois`) })

        it("a default multi line string with another line at end",
            function() { expect(  parse({src_data: `tagada 
pouet pouet 
2 fois

plus un`, dsl_data: "main: string"}).contents.getChild(0).value).toEqual(`tagada pouet pouet 2 fois\nplus un`) })

        it("a default multi line string with escapes, quotes and another line at end",
            function() { expect(  parse({src_data: `tagada 
  pouet pouet\n"der" 
  2 'fois'

  plus un`, dsl_data: "main: string"}).contents.getChild(0).value).toEqual(`tagada pouet pouet "der" 2 'fois'\nplus un`) })

        it("single quoted string with escapes, quotes and another line at end",
            function() { expect(  parse({src_data: `'tagada 
pouet pouet (newline \\n)\n"der" 
2 ''fois''

plus un'`, dsl_data: "main: string"}).contents.getChild(0).value).toEqual(`tagada pouet pouet (newline \\n) "der" 2 'fois'\nplus un`) })

        it("double quoted string with escapes, quotes and another line at end",
            function() { expect(  parse({src_data: `"tagada 
pouet pouet (newline \\\\n)\\n\\"der\\" 
2 'fois'

plus un"`, dsl_data: "main: string"}).contents.getChild(0).value).toEqual(`tagada pouet pouet (newline \\n)\n"der" 2 'fois'\nplus un`) })


        it("folded block scalar style",
            function() { expect(  parse({src_data: `>
  tagada
  pouet pouet
  2 fois

  plus un`, dsl_data: "main: string"}).contents.getChild(0).value).toEqual(`tagada pouet pouet 2 fois\nplus un\n`) })

        it("folded block scalar style, no new line at end",
            function() { expect(  parse({src_data: `>-
    tagada
    pouet pouet
    2 fois
  
    plus un`, dsl_data: "main: string"}).contents.getChild(0).value).toEqual(`tagada pouet pouet 2 fois\nplus un`) })

        it("folded block scalar style, all newlines at end",
            function() { expect(  parse({src_data: `>+
      tagada
      pouet pouet
      2 fois
    
      plus un
      
      `, dsl_data: "main: string"}).contents.getChild(0).value).toEqual(`tagada pouet pouet 2 fois\nplus un\n\n`) })

        it("literal block scalar style",
            function() { expect(  parse({src_data: `|
  tagada
  pouet pouet
  2 fois

  plus un`, dsl_data: "main: string"}).contents.getChild(0).value).toEqual(`tagada\npouet pouet\n2 fois\n\nplus un\n`) })

        it("literal block scalar style, no new line at end",
            function() { expect(  parse({src_data: `|-
    tagada
    pouet pouet
    2 fois

    plus un`, dsl_data: "main: string"}).contents.getChild(0).value).toEqual(`tagada\npouet pouet\n2 fois\n\nplus un`) })

        it("literal block scalar style, all newlines at end",
            function() { expect(  parse({src_data: `|+
  tagada
  pouet pouet
  2 fois

  plus un

`, dsl_data: "main: string"}).contents.getChild(0).value).toEqual(`tagada\npouet pouet\n2 fois\n\nplus un\n\n`) })

        it("literal string with bad indent", 
            function() { expect(  parse({src_data: `|+
    tagada
    pouet pouet

    2 fois 
  plus un
`, dsl_data: "main: string"}).errors[0].name).toEqual('YAMLParseError') })

        it("A string is not a number",
            function() { expect( parse({src_data: "11", dsl_data: "main: string"}).errors[0].name).toEqual('SYNTAX_ERROR') })

        it("A string is not a boolean",
            function() { expect( parse({src_data: "false", dsl_data: "main: string"}).errors[0].name).toEqual('SYNTAX_ERROR') })

        it("A string is not null",
            function() { expect( parse({src_data: "~", dsl_data: "main: string"}).errors[0].name).toEqual('SYNTAX_ERROR') })
        })

})
