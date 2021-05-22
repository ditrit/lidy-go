import { ScalarNode } from "../scalarnode.js"
import { isScalar  } from 'yaml'

// BinaryNode manages values stored in base64 format
export class BinaryNode extends ScalarNode {
  constructor(ctx, current) {
    super(ctx, 'binary', current)
    if (checkCurrent(current)) {
        this.value = current.value
    } else {
      throw ctx.syntaxError(current, `Error: value '${current ? current.value : ""}' is not a base64 string`)
    }
  }

  static checkCurrent(current) {
    return isScalar(current) && (typeof(current.value) == 'string') && /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(this.value)
  }

  static parse(ctx, current) {
    if (checkCurrent(current)) { return new Base64Node(ctx, current) }
    return null
  }

}

