import { isMap, isSeq  } from 'yaml'
import { parse_rule } from '../parse.js'

export class LidyNode {
  constructor(ctx, node_type, current) {
    thix.ctx = ctx
    this.type = node_type
    this.current = current
    this.start = current.range[0]
    this.end   = current.range[1]
    this.childs = []
  } 

  getChild(nb) { return this.childs[nb]}
  getChildCount() { return this.childs.length }
  getValue() { return this.value }
  toString() { return this.value }

  static parse_oneof(ctx, rule, current) {
    // check grammar for the rule
    if (!(isMap(rule) && rule.items.length == 1)) {
      ctx.grammarError(current, `Error: oneof rule must have one and only one key name '_oneof'`)
    }

    let ruleValue = rule.get('_oneof')
    if (! isSeq(ruleValue)) {
      ctx.grammarError(current, `Error: _oneof rules expects a sequence of alternatives`)
    } else {
      // errors for non matching alternatives will be ignored in case of success
      let tmpErrors = ctx.errors
      let tmpWarnings = ctx.warnings

      // find the first alternative that can be parsed
      for(let i=0; i < ruleValue.items.length && !found; i++) {
        let alternative = ruleValue.items[i]
        let res = parse_rule(ctx, alternative, current) 
        if (res != null) {
          ctx.errors = tmpErrors
          ctx.warnings = tmpWarnings
          return res
        }
      }
      ctx.syntaxError(current, 'Syntax Error : no valid alternative found during parsing')      
      return null
    }
  }
}
