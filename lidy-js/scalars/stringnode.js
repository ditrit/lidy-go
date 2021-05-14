import { LidyNode } from "../lidynode.js"
import { isScalar  } from 'yaml'


export class StringNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'string', current)
    if (isScalar(current)) {
      this.value = current.value
      if (typeof(this.value) != 'string') {
        ctx.syntaxError(current, `Error: value '${this.value}' is a '${typeof(this.value)}', not a string`)
      }
    } else {
      ctx.syntaxError(current, `Error: no string found as value`)
    }
  }
}
