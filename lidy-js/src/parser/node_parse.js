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
function compile_dsl(input) {
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

function create_js_parser(rules, name) {
  let content = file_content(rules)
  try {
  fs.writeFileSync(name, content)
  } catch {
    console.log(`can not write json file '${name}'`)
    return 
  }
  console.log(`dsl rules stored in the file ${name}.`)
}

function file_content(rules) {
  let jsonRules = JSON.stringify(rules)
  return `import { parse as parse_input } from '../parser/parse.js'
let rules=${jsonRules}
export function parse(input) { 
  input.rules = rules
  return parse_input(input)
}`
}

export function preprocess(dsl_file) {
  let rules = compile_dsl({dsl_file: dsl_file})
  const dsl_parser = dsl_file.split('.').slice(0, -1).join('.') + ".js"
  create_js_parser(rules, dsl_parser)
}


