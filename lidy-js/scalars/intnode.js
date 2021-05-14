import { LidyNode } from "../lidynode.js"
import { isScalar  } from 'yaml'

export class IntNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'int', current)
    if (isScalar(current)) {
      let number = Number(current.value)
      if (isNaN(number)) {
        ctx.syntaxError(current, `Error: value '${current.value}' is not a number`)
      } else {
        if (number != Math.floor(number)) {
          ctx.syntaxError(current, `Error: value '${current.value}' is not an integer`)
        }
      }
      this.value = number
    } else {
      ctx.syntaxError(current, `Error: no integer found as value`)
    }
  }
}
