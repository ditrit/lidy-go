import { parse_rule } from "./parse.js"

export class RuleParser {
  static scalartypes  = ['string', 'int', 'float', 'null', 'boolean', 'binary', 'timestamp']
  static keywords     = [ '_map', '_mapOf', '_mapFacultative','_list', '_listOf', '_listFacultative', '_oneOf', '_regex', '_nb', '_min', '_max', '_in'] // merge?

  static parse(ctx, rule_name, rule, current) {

    if (RuleParser.scalartypes.includes(rule_name) || RuleParser.keywords.includes(rule_name)) {
      ctx.syntaxError(current, `'${rule_name}' is not allowed as rule_name in Lidy Grammar (reserved keyword)`)
      return null
    }
    let  parsedRule = parse_rule(ctx, null, rule, current)
    return parsedRule
  }
}
