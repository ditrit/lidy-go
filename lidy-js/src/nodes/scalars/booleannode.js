import { ScalarNode } from "./scalarnode.js"
import { isScalar  } from 'yaml'

export class BooleanNode extends ScalarNode {
  constructor(ctx, current) {
    super(ctx, 'boolean', current)
    this.value = null
    if (BooleanNode.checkCurrent(current)) {
          this.value = current.value
    } else {
      throw ctx.syntaxError(current, `Error: value '${current.value}' is not a boolean`)
    }
  }

  static checkCurrent(current) {
    return isScalar(current) && (typeof(current.value) == 'boolean')
  }

  static parse(ctx, current) {
    try { return new BooleanNode(ctx, current) 
    } catch (error) {
      return null
    }
  }
}
