import { LidyNode } from '../lidynode.js'

export class ScalarNode extends LidyNode {
  constructor(ctx, typeName, current) {
    super(ctx, typeName, current)
  }
  equals(other) {
    if (other instanceof ScalarNode) {
      return this.value == other.value
    } else {
      this.ctx.syntaxError(this.current, `Error can not compare values '${this.value}' and '${other.value}'`)
    }
  }

}
