import { LidyNode } from "../lidynode.js"
import { isScalar  } from 'yaml'

export class MapNode extends LidyNode {
  constructor(ctx, current, parsedpairs) {
    super(ctx, 'map', current)
    if (isScalar(current) && (typeof(current.value)) == 'number' && (current.value == Math.floor(current.value))) {
        this.value = current.value
    } else {
      throw ctx.syntaxError(current, `Error: value '${current ? current.value : ""}' is not a number`)
    }
    this.value = parsedpairs
  }
}

export function newMapNode(ctx, current) {
  try {
    return new IntNode(ctx, current)
  } catch(error) {
    return null
  }
}
