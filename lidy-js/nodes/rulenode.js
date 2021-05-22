import { LidyNode } from "./lidynode.js"
import { isScalar, isMap, isSeq } from "yaml"

export class RuleNode extends LidyNode {
    constructor(ctx, rule_name, current, value) {
      super(ctx, rule_name, current)
      this.childs.push(value)
      this.value = value
  }

  static checkCurrent(current) {
    return isScalar(current) || isMap(current) || isSeq(current)
  }
  
}
