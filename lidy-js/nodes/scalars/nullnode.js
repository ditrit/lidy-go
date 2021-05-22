import { ScalarNode } from "./scalarnode.js"
import { isScalar  } from 'yaml'

export class NullNode extends ScalarNode {
  constructor(ctx, current) {
    super(ctx, 'null', current)
    this.value = null
    if (!NullNode.checkCurrent(current)) {
      throw ctx.syntaxError(current, `Error: value '${current ? current.value : "" }' is not the null value`)
    }
  }

  static checkCurrent(current) {
    return (isScalar(current) && ( current.value == null ||  ["Null","NULL","null", "~"].includes(current.value)))
  }

  static parse(ctx, current) {
    try { return new NullNode(ctx, current) 
    } catch (error) {
      return null
    }

  }

}

