import { parse_rule } from './parse.js'

export class OneOfParser {

  static parse(ctx, rule, current) {
    // check grammar for the rule
    if (!(typeof(rule) == 'object')) {
      ctx.grammarError(`Error: oneof rule can not be parsed'`)
    }

    let ruleValue = rule._oneOf
    if (! (ruleValue instanceof Array)) {
      ctx.grammarError(`Error: _oneof rules expects a sequence of alternatives`)
    } else {
      // errors for non matching alternatives will be ignored in case of success
      let tmpErrors = [].concat(ctx.errors)
      let tmpWarnings = [].concat(ctx.warnings)

      // find the first alternative that can be parsed
      let nbErrors = ctx.errors.length
      for(let alternative of ruleValue) {
        let res = parse_rule(ctx, null, alternative, current) 
        if (nbErrors == ctx.errors.length) {
          ctx.errors = tmpErrors
          ctx.warnings = tmpWarnings
          return res
        } else {
          nbErrors = ctx.errors.length
        }
      }
      ctx.syntaxError(current, 'Syntax Error : no valid alternative found during parsing')      
      return null
    }
  }
}
