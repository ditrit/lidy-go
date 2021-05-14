import { LidyNode } from "../lidynode.js"
import { isScalar  } from 'yaml'

export class IntNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'int', current)
    if (isScalar(current) && (typeof(current.value)) == 'number' && (current.value == Math.floor(current.value))) {
        this.value = current.value
    } else {
      throw ctx.syntaxError(current, `Error: value '${current ? current.value : ""}' is not a number`)
    }
  }
}

export function newIntNode(ctx, current) {
  try {
    return new IntNode(ctx, current)
  } catch(error) {
    return null
  }
}
