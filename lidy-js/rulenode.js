import { LidyNode } from "./lidynode.js"
import { LidyError } from "./errors.js"
import { parse_rule } from "./parse.js"

export class RuleNode extends LidyNode {
    constructor(ctx, rule_name, rule, current) {
      super(ctx, rule_name, current)
      this.childs.push(parse_rule(ctx, null, rule, current))
      if (['string'].includes(rule_name)) {
        ctx.errors.push(new LidyError('RuleSyntax', current.range[0], `'Error : ${rule_name}' is not allowed as rule_name in Lidy Grammar (reserved keyword)`))
      }
    }
  }
