import { StringNode } from "../nodes/scalars/stringnode.js"
import { isScalar  } from 'yaml'


export class RegexParser {

  static parse(ctx, rule, current) {
    // current value is a string ?
    if (! StringNode.checkCurrent(current)) {
      ctx.syntaxError(current, `Error: regular expressions match only strings, '${(current) ? current.value : ""}' is not a string`)
      return null
    }

    // rule syntax is ok ('_regex' is the only one keyword)
    let ruleValue = rule._regex
    if (ruleValue == null) {
      ctx.grammarError(`Error : regep rule must have a value for key '_regex'`)
      return null
    }

    // regex pattern is ok (can be parsed as javascript regexp)
    let regex = null
    try {
      regex = new RegExp(ruleValue.value)
    } catch (error) {}
    if (regex == null) {
      ctx.grammarError(current, `Error: value '${regex}' is not a valid regular expression`)
      return null
    }

    // string value matches the regex pattern
    if (! regex.test(current.value)) {
      ctx.syntaxError(current, `Error: value '${current.value}' does not match the regular expression '${regex}'`)
    return null
   } 

   // everything is ok
   return new StringNode(ctx, current)
  }

}

