import { LidyNode } from "../lidynode.js"
import { isScalar  } from 'yaml'

export class NullNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'null', current)
    this.value = current.value
    if (isScalar(current)) {
      if ( current.value = null ||  ["Null","NULL","null", "~"].includes(current.value) ) {
        this.value = null
      } else {
        ctx.syntaxError(current, `Error: value '${current.value}' is not the null value`)
      }
    } else {
        ctx.syntaxError(current, `Error: null value not found`)
    }
  }
}
