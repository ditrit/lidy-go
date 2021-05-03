import fs   from 'fs'
import path from 'path'
import { PerformanceObserver } from 'perf_hooks'

import {
    Document,
    isDocument,
    parseDocument,
    isAlias, isCollection, isMap,
    isNode, isPair, isScalar, isSeq,
    Scalar, visit, YAMLMap, YAMLSeq,
    LineCounter
  } from 'yaml'

function parse_dsl(ctx, dsl_data, top_rule) {
  let dsl_doc = parseDocument(dsl_data)
  if ( ! dsl_doc ) throw Error("ERROR : can not parse dsl ")
  if (dsl_doc.errors.length > 0 || dsl_doc.warnings.lentgh > 0) throw Error("ERROR : errors parsing dsl")
  if (!isMap(dsl_doc.contents)) throw Error("ERROR : no grammar rules found")
  ctx.dsl_rules = dsl_doc.contents
  if (! ctx.dsl_rules.has(top_rule)) throw Error("ERROR : no rule labeled '" + top_rule + "' in the grammar")
  return ctx
}

function parse_src(ctx, src_data) {
  ctx.lineCounter = new LineCounter()
  let src_doc = parseDocument(src_data, {lineCounter: ctx.lineCounter})
  if ( ! src_doc ) throw Error("ERROR : can not parse the provided source code.")
  ctx.src = src_doc.contents
  ctx.errors   = src_doc.errors
  ctx.warnings = src_doc.warnings
  ctx.yaml_ok  = (ctx.errors.length == 0) && (ctx.warnings.length == 0)
  return ctx
}

// main lidy function to parse source code using lidy grammar
function parse(input) { 
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

  let ctx = {} // initialise context

  ctx = parse_dsl(ctx, input.dsl_data, input.keyword) // yaml parsing of the grammar rules
  ctx = parse_src(ctx, input.src_data)                // yaml parsing of the source code 
//  ctx = parse_src_dsl(ctx, input.keyword)       // dsl parsing of the source code

  return ctx
}

let ctx = parse({src_data: "", dsl_file: "./schema.lidy.yaml"})
console.log(ctx)
