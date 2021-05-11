import fs   from 'fs' // only for node
import { Ctx } from './lidyctx.js'
import { LidyError } from './errors.js'
import { RuleNode } from './rulenode.js'
import { StringNode, IntNode, FloatNode, BooleanNode, NullNode } from './scalars.js'
import {
    parseDocument,
    isAlias, isCollection, isMap,
    isNode, isPair, isScalar, isSeq,
    Scalar, YAMLMap, YAMLSeq,
    LineCounter
  } from 'yaml'

function parse_scalar(ctx, keyword, current) {
  switch (keyword) {
    case 'string': return new StringNode(ctx, current)
    case 'int': return new IntNode(ctx, current)
    case 'float': return new FloatNode(ctx, current)
    case 'boolean': return new BooleanNode(ctx, current)
    case 'null' : return new NullNode(ctx, current)
  }
}

export function parse_rule(ctx, rule_name, rule, current) {
  if (rule_name) { 
    return new RuleNode(ctx, rule_name, rule, current)
  }
  if ( isScalar(rule) ) {
    return parse_scalar(ctx, rule.value, current)
  } 
  return null

}

function parse_lidy(ctx, rule_name, current) {      // dsl parsing of the source code
  let lidyNode
  // 'ctx' is the context of Lidy
  // 'rule_name' is the name of the grammar rule to be used
  let rule = ctx.rules.get(rule_name, true)
  if (rule === undefined) { 
    ctx.grammarError(ctx.src, `no rule named ${rule_name} found.`)
  } else {
    lidyNode = parse_rule(ctx, rule_name, rule, current)
  }

  // insert position and complete messages into errors and warnings
  ctx.errors.filter(x => x instanceof LidyError).forEach(x => x.pretty(ctx))
  ctx.warnings.filter(x => x instanceof LidyError).forEach(x => x.pretty(ctx))

  ctx.contents = lidyNode
}

// Parsing of grammar rules
function parse_dsl(ctx, dsl_data, top_rule) {
  // 'ctx' is the context of Lidy
  // 'dsl_data' is the textual contents of the grammar (lidy rules in YAML format) 
  // 'top_rules is the label of top level rule to be used as entry point by Lidy 
  let dsl_doc = parseDocument(dsl_data)
  if ( ! dsl_doc ) throw Error("ERROR : can not parse dsl ")
  if (dsl_doc.errors.length > 0 || dsl_doc.warnings.lentgh > 0) throw Error("ERROR : errors parsing dsl")
  if (!isMap(dsl_doc.contents)) throw Error("ERROR : no grammar rules found")
  ctx.rules = dsl_doc.contents
  if (! ctx.rules.has(top_rule)) throw Error("ERROR : no rule labeled '" + top_rule + "' in the grammar")
}

// First step of parsing for the source code : only YAML pasing
function parse_src(ctx, src_data) {
  // 'ctx' is the context of Lidy
  // 'src_data' is the textual contents of the source code 
  ctx.lineCounter = new LineCounter()
  let src_doc = parseDocument(src_data, {lineCounter: ctx.lineCounter})
  if ( ! src_doc ) ctx.fileError("can not parse the provided source code.")
  ctx.src = src_doc.contents
  ctx.txt = src_data
  ctx.errors   = src_doc.errors
  ctx.warnings = src_doc.warnings
  ctx.yaml_ok  = (ctx.errors.length == 0) && (ctx.warnings.length == 0)
}

// main lidy function to parse source code using lidy grammar
export function parse(input) { 
  // input is an object with two attributes :
  //  - one to provide the source code to code, 
  //    among 'src_file' and 'src_data' depending on whether you want to indicate a file or a text.
  //  - one to provide the lidy grammar to use,  
  //    among 'dsl_file' and 'dsl_data' depending on whether you want to indicate a file or a text.
  // if a both filename and data are provided, content of the file is used rather than data
  if (input.dsl_file != null) {
    input.dsl_data = fs.readFileSync(input.dsl_file, 'utf8')
  } else { input.dsl_file = 'stdin' }
  if (input.dsl_data == null) { throw Error("No dsl definition found from provided input") }

  if (input.src_file != null) {
    input.src_data = fs.readFileSync(input.src_file, 'utf8')
  } else { input.src_file = 'stdin' }
  if (input.dsl_data == null) { throw Error("No source code found from provided input") }

  if (!input.keyword) input.keyword = 'main' // use 'top' rule of the grammat as entry point if none is provided

  let ctx = new Ctx() // initialise context

  parse_dsl(ctx, input.dsl_data, input.keyword) // yaml parsing of the grammar rules
  parse_src(ctx, input.src_data)                // yaml parsing of the source code 
  parse_lidy(ctx, input.keyword, ctx.src)       // dsl parsing of the source code

  return ctx
}

/*let ctx = parse({src_data: "10", dsl_data: "main: string"})
console.log(ctx)
console.log(ctx.errors)
*/
let res = parse({src_data: "tagada", dsl_data: "main: string"})
console.log(res.contents.getChild(0).value)