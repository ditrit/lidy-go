import fs   from 'fs' // only for node
import { Ctx } from './lidyctx.js'
import { LidyError } from './errors.js'
import { ScalarParser } from './scalarparser.js'
import { OneOfParser } from './oneofparser.js'
import { RegexParser } from './regexparser.js'
import { MapParser } from './mapparser.js'
import { ListParser } from './listparser.js'
import { parseDocument, isMap, isScalar, LineCounter } from 'yaml'
import { RuleParser } from './ruleparser.js'

export function parse_rule(ctx, rule_name, rule, current) {
  if (rule_name) { 
    return RuleParser.parse(ctx, rule_name, rule, current)
  }
  if ( isScalar(rule) ) {
    if (rule.value == null) {
      rule.value = "null"
    }
    return ScalarParser.parse(ctx, rule.value, current)
  } 
  if ( isMap(rule) ) {
    if (rule.has('_map') || rule.has('_mapOf') || rule.has('_mapFacultative') || rule.has('_merge')) {
      return MapParser.parse(ctx, rule, current)
    }
    if (rule.has('_list') || rule.has('_listOf') || rule.has('_listFacultative')) {
      return ListParser.parse(ctx, rule, current)
    }
    if (rule.has('_oneOf')) {
      return OneOfParser.parse(ctx, rule, current) 
    }
    if (rule.has('_regex')) {
      return RegexParser.parse(ctx, rule, current)
    }
  }
  return null

  // TODO : _in , _merge
}

export function parse_rule_name(ctx, rule_name, current) {
  // 'ctx' is the context of Lidy
  // 'rule_name' is the name of the grammar rule to be used
  let rule = ctx.rules.get(rule_name, true)
  if (rule === undefined) { 
    ctx.grammarError(ctx.src, `no rule named ${rule_name} found.`)
  } else {
    return parse_rule(ctx, rule_name, rule, current)
  }
  return null
}

function parse_lidy(ctx, rule_name, current) {      // dsl parsing of the source code
  let lidyNode = parse_rule_name(ctx, rule_name, current)

  // insert position and complete messages into errors and warnings
  ctx.errors.filter(x => x instanceof LidyError).forEach(x => x.pretty(ctx))
  ctx.warnings.filter(x => x instanceof LidyError).forEach(x => x.pretty(ctx))

  ctx.contents = lidyNode
  return ctx
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
  ctx.dsl_doc = dsl_doc
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
  return parse_lidy(ctx, input.keyword, ctx.src)       // dsl parsing of the source code

}

