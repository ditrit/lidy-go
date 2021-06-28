import fs   from 'fs' // only for node
import { Ctx } from './lidyctx.js'
import { parse as parse_yaml } from 'yaml'
import { parse as parse_data } from './parse.js'
import { MergeParser } from "./mergeparser.js"


// main lidy function to parse source code using lidy grammar
export function parse(input) { 
  // input is an object with three attributes :
  //  - one to provide the source code to code, 
  //    among 'src_file' and 'src_data' depending on whether you want to indicate a file or a text.
  //  - one to provide the lidy grammar to use,  
  //    among 'dsl_file' and 'dsl_data' depending on whether you want to indicate a file or a text.
  // if a both filename and data are provided, content of the file is used rather than data
  //  - one 'keyword'  to define the entry point keyword in the grammar  
  if (input.dsl_file != null) {
    input.dsl_data = fs.readFileSync(input.dsl_file, 'utf8')
  } else { input.dsl_file = 'stdin' }
  if (input.dsl_data == null) { throw Error("No dsl definition found from provided input") }

  if (input.src_file != null) {
    input.src_data = fs.readFileSync(input.src_file, 'utf8')
  } else { input.src_file = 'stdin' }
  if (input.dsl_data == null) { throw Error("No source code found from provided input") }

  return parse_data(input) // yaml parsing of the grammar rules

}

// grammar_compile analyses a lidy grammar
// and produces its javascript set of rules 
// to be used to analyse source code
export function grammar_compile(input) {
  // input is an object with two attributes :
  //  - one to provide the lidy grammar to use,  
  //    among 'dsl_file' and 'dsl_data' depending on whether you want to indicate a file or a text.
  // if a both filename and data are provided, content of the file is used rather than data
  //  - one 'keyword'  to define the entry point keyword in the grammar  
  if (input.dsl_file != null) {
    input.dsl_data = fs.readFileSync(input.dsl_file, 'utf8')
  } else { input.dsl_file = 'stdin' }
  if (input.dsl_data == null) { throw Error("No dsl definition found from provided input") }
  if (!input.keyword) input.keyword = 'main' // use 'top' rule of the grammar as entry point if none is provided
  let ctx = new Ctx() 
  ctx.rules = parse_yaml(input.dsl_data)
  if (ctx.rules != null) {
    for (const rule in ctx.rules) {
      ctx.rules[rule] = MergeParser.parse(ctx, ctx.rules[rule])
    }
  }
  return ctx.rules
}

