import { LidyNode } from "../lidynode.js"
import { isScalar  } from 'yaml'


export class StringNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'string', current)
    if (isScalar(current) && (typeof(current.value) == 'string')) {
      this.value = current.value
    } else {
      throw ctx.syntaxError(current, `Error: value '${current ? current.value : ""}' is not a string`)
    }
  }
}

export function newStringNode(ctx, current) {
  try {
    return new StringNode(ctx, current)
  } catch(error) {
    return null
  }
}
