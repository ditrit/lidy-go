import { LidyNode } from "../lidynode.js"
import { isScalar  } from 'yaml'

export class Base64Node extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'base64', current)
    if (isScalar(current) && (typeof(current.value) == 'string') && ( /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(this.value) ) ) {
        return new Base64Node(ctx, current)
    } else {
      throw ctx.syntaxError(current, `Error: value '${current ? current.value : ""}' is not a base64 string`)
    }
  }
}

export function newBase64Node(ctx, current) {
  try {
    return new BooleanNode(ctx, current)
  } catch(error) {
    return null
  }
}
