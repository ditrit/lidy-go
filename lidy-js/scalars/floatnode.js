import { LidyNode } from "../lidynode.js"
import { isScalar  } from 'yaml'

export class FloatNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'float', current)
    if (isScalar(current) && typeof(current.value == 'number')) {
      this.value = current.value
    } else {
      throw ctx.syntaxError(current, `Error: value '${current ? current.value : ""}' is not a number`)
    }
  }
}

export function newFloatNode(ctx, current) {
  try {
    return new IntNode(ctx, current)
  } catch(error) {
    return null
  }
}

