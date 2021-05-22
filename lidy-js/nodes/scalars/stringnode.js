import { ScalarNode } from "../scalarnode.js"
import { isScalar  } from 'yaml'


export class StringNode extends ScalarNode {
  constructor(ctx, current) {
    super(ctx, 'string', current)
    if (checkCurrent(current)) {
      this.value = current.value
    } else {
      throw ctx.syntaxError(current, `Error: value '${current ? current.value : ""}' is not a string`)
    }
  }

  static checkCurrent(current) {
    return isScalar(current) && (typeof(current.value) == 'string')
  }

  static parse(ctx, current) {
    if (checkCurrent(current)) { return new StringNode(ctx, current) }
    ctx.syntaxError(current, `Error : value '${(current) ? current.value : ""}' is not a string`)
    return null

  }

  static parse_regex(ctx, rule, current) {
    // current value is a string ?
    if (! this.checkCurrent(current)) {
      ctx.syntaxError(current, `Error: regular expressions match only strings, '${(current) ? current.value : ""}' is not a string`)
      return null
    }

    // rule syntax is ok ('_regex' is the only one keyword)
    let ruleValue = rule.get('_regexp')
    if (ruleValue == null || rule.items.length != 1) {
      ctx.grammarError(`Error : regep rule must have only one key named '_regex'`)
      return null
    }

    // regex pattern is ok (can be parsed as javascript regexp)
    let regex = null
    if (isScalar(ruleValue)) {
      try {
        regex = new RegExp(ruleValue.value)
      } catch (error) {}
    }
    if (regex == null) {
      ctx.grammarError(current, `Error: value '${regex}' is not a valid regular expression`)
      return null
    }

    // string value matches the regex pattern
    if (! regex.test(current.value)) {
      ctx.syntaxError(current, `Error: value '${current.value}' does not match the regular expression '${regexp}'`)
    return null
   } 

   // everything is ok
   return new StringNode(ctx, current)
  }

}

