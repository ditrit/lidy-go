import { ScalarNode } from "./scalarnode.js"
import { isScalar  } from 'yaml'

// BinaryNode manages values stored in base64 format
export class BinaryNode extends ScalarNode {
  constructor(ctx, current) {
    super(ctx, 'binary', current)
    if (BinaryNode.checkCurrent(current)) {
        this.value = current.value
    } else {
      throw ctx.syntaxError(current, `Error: value '${current ? current.value : ""}' is not a base64 string`)
    }
  }

  static checkCurrent(current) {
    return isScalar(current) && (typeof(current.value) == 'string') && /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(current.value)
  }

  static parse(ctx, current) {
    try {
      return new BinaryNode(ctx, current)
    } catch (error) {
    return null
    }
  }

}

