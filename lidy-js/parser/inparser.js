import { isScalar } from 'yaml'
import { ScalarParser } from '../parser/scalarparser.js'
import { isScalarType } from './utils.js'

export class InParser {

  static parse(ctx, rule, current) {
    // check grammar for the rule
    if (typeof(rule) != 'object' || !rule._in) {
      ctx.grammarError(current, `Error:  can not parse _in rule'`)
    }

    let ruleValue = rule._in
    if (! (ruleValue instanceof Array) ) {
      ctx.grammarError(current, `Error: _in rules expects a sequence of alternatives`)
      return null
    }
    for (let ele of ruleValue) {
      if (!isScalarType(ele)) {
        ctx.grammarError(current, `Error: _in rules expects each alternative to be a scalar`)
        return null
      }
    }
    if (!isScalar(current)) {
      ctx.syntaxError(current,  `Syntax Error : scalar value expected by rule '_in'`)      
      return null
    }

    let parsedCurrent = ScalarParser.parse_any(ctx, current)

    if (parsedCurrent) {
      // errors for non matching alternatives will be ignored in case of success
      let tmpErrors = [].concat(ctx.errors)
      let tmpWarnings = [].concat(ctx.warnings)
      // find the first alternative that can be parsed
      let nbErrors = ctx.errors.length
      let currentValue = parsedCurrent.value

      for(let alternative of ruleValue) {
        if (alternative) {
          let res = (alternative == currentValue) ? parsedCurrent : null
          if (res != null) {
            ctx.errors = tmpErrors
            ctx.warnings = tmpWarnings
            return res
          } else {
            nbErrors = ctx.errors.length
          }
        }
      }
    }
    ctx.syntaxError(current, `Syntax Error : no valid alternative for '_in' rule found during parsing`)      
    return null
  }
}
