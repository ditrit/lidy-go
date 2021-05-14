import { LidyNode } from "../lidynode.js"
import { isScalar  } from 'yaml'

export class NullNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'null', current)
    this.value = null
    if ((! isScalar(current)) || ( current.value != null &&  !(["Null","NULL","null", "~"].includes(current.value)))) {
      throw ctx.syntaxError(current, `Error: value '${current ? current.value : "" }' is not the null value`)
    }
  }
}

export function newNullNode(ctx, current) {
  try {
    return new NullNode(ctx, current)
  } catch(error) {
    return null
  }
}
