import { ScalarNode } from "./scalarnode.js"
import { isScalar  } from 'yaml'

export class FloatNode extends ScalarNode {
  constructor(ctx, current) {
    super(ctx, 'float', current)
    if (FloatNode.checkCurrent(current)) {
      this.value = current.value
    } else {
      throw ctx.syntaxError(current, `Error: value '${current ? current.value : ""}' is not a number`)
    }
  }

  static checkCurrent(current) {
    return isScalar(current) && typeof(current.value == 'number')
  }

  static parse(ctx, current) {
    if (FloatNode.checkCurrent(current)) { return new FloatNode(ctx, current) }
    return null

  }

}


