import { ScalarNode } from "./scalarnode.js"
import { isScalar  } from 'yaml'


export class StringNode extends ScalarNode {
  constructor(ctx, current) {
    super(ctx, 'string', current)
    if (StringNode.checkCurrent(current)) {
      this.value = current.value
    } else {
      throw ctx.syntaxError(current, `Error: value '${current ? current.value : ""}' is not a string`)
    }
  }

  static checkCurrent(current) {
    return isScalar(current) && (typeof(current.value) == 'string')
  }

  static parse(ctx, current) {
    try { return new StringNode(ctx, current) 
    } catch (error) {
      return null
    }

  }

}

