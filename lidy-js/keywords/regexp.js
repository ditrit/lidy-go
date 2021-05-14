import { StringNode } from "../scalars/stringnode.js"
import { isScalar  } from 'yaml'


export function parse_regexp(ctx, rule, current) {
  let ruleValue = rule.get('_regexp')
  let regexp = null
  if (isScalar(ruleValue)) {
    try {
      regexp = new RegExp(ruleValue.value)
    } catch (error) {}
  }
  if (regexp != null) {
    if (isScalar(current) && current.value instanceof string) {
      if (regexp.test(current.value)) {
        return new StringNode(ctx, current)
      } else {
        ctx.syntaxError(current, `Error: value '${current.value}' does not match the regular expression '${regexp}'`)
      }
    }
  } else {
      ctx.grammarError(current, `Error: value '${regexp}' is not a valid regular expression`)
  }
  return null
}
