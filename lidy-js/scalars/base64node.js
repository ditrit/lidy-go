import { LidyNode } from "../lidynode.js"
import { isScalar  } from 'yaml'

export class Base64Node extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'base64', current)
    if (isScalar(current)) {
      this.value = current.value
      if (typeof(this.value) != 'string') {
        ctx.syntaxError(current, `Error: value '${this.value}' is a '${typeof(this.value)}', not a base64 string`)
      } else {
        if (! ( /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(this.value) ) ) {
          ctx.syntaxError(current, `Error: value '${this.value}' is not a base64 string`)
        }  
      }
    } else {
      ctx.syntaxError(current, `Error: no base64 string found as value`)
    }
  }
}

