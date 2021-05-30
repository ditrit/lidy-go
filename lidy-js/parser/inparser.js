import { isMap, isScalar, isSeq  } from 'yaml'
import { parse_rule } from './parse.js'

export class InParser {

  static parse(ctx, rule, current) {
    // check grammar for the rule
    if (!(isMap(rule) && rule.items.length == 1)) {
      ctx.grammarError(current, `Error: oneof rule must have one and only one key name '_in'`)
    }

    let ruleValue = rule.get('_in', true)
    if (! isSeq(ruleValue)) {
      ctx.grammarError(current, `Error: _in rules expects a sequence of alternatives`)
      return null
    }
    for (ele of ruleValue.items) {
      if (!isScalar(ele)) {
        ctx.grammarError(current, `Error: _in rules expects each alternative to be a scalar`)
        return null
      }
    }
    if (!isScalar(current)) {
      ctx.syntaxError(current,  `Syntax Error : scalar value expected by rule '_in'`)      
      return null
    }

    // errors for non matching alternatives will be ignored in case of success
    let tmpErrors = [].concat(ctx.errors)
    let tmpWarnings = [].concat(ctx.warnings)
    // find the first alternative that can be parsed
    let nbErrors = ctx.errors.length
    for(let alternative of ruleValue.items) {
      let res = (alternative.equals(current)) ? current : null
      if (nbErrors == ctx.errors.length) {
        ctx.errors = tmpErrors
        ctx.warnings = tmpWarnings
        return res
      } else {
        nbErrors = ctx.errors.length
      }
    }
    ctx.syntaxError(current, `Syntax Error : no valid alternative for '_in' rule found during parsing`)      
    return null
    
  }
}
