import { isSeq  } from 'yaml'
import { parse_rule } from '../parse.js'

export function parse_oneof(ctx, rule, current) {
  let ruleValue = rule.get('_oneof')
  if (! isSeq(ruleValue)) {
    ctx.grammarError(current, `Error: _oneof rules expects a sequence of alternatives`)
  } else {
    let preChoicesErrors = ctx.errors
    let preChoicesWarnings = ctx.warnings
    for(let i=0; i < ruleValue.items.length && !found; i++) {
      let choice = ruleValue.items[i]
      let res = parse_rule(ctx, choice, current) 
      if (res != null) {
        ctx.errors = preChoicesErrors
        ctx.warnings = preChoicesWarnings
        return res
      }
    }
    ctx.syntaxError(current, 'Syntax Error : no valid alternative found during parsing')      
    return null
  }
}
