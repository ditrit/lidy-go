import { LidyNode } from "../lidynode.js"
import { isCollection, isScalar  } from 'yaml'


export class AnyNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'any', current)
    if (isScalar(current) || isCollection(current)) {
      this.value = current.toJSON()
    } else {
      ctx.syntaxError(current, `Error: no value found for 'any'`)
    }
  }
}
