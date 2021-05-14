import { LidyNode } from "../lidynode.js"
import { isScalar  } from 'yaml'

export class FloatNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'float', current)
    if (isScalar(current)) {
      let number = Number(current.value)
      if (isNaN(number)) {
        ctx.syntaxError(current, `Error: value '${current.value}' is not a number`)
      } 
      this.value = number
    } else {
      ctx.syntaxError(current, `Error: no float found as value`)
    }
  }
}
