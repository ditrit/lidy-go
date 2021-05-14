import { LidyNode } from "../lidynode.js"
import { isScalar  } from 'yaml'

export class BooleanNode extends LidyNode {
  constructor(ctx, current, bool) {
    super(ctx, 'boolean', current)
    this.value = null
    if (isScalar(current)) {
      if (["F","f","FALSE","False","false","N","n","NO","No","no","OFF","Off","off"].includes(current.value)) {
        this.value = false
      } else  {
        if (["T","t","TRUE","True","true","Y","y","YES","Yes","yes","ON","On","on"].includes(current.value)) {
          this.value = true
        }
      }
    }
    if (this.value == null) {
      throw ctx.syntaxError(current, `Error: value '${current.value}' is not a boolean`)
    }
  }
}

export function newBooleanNode(ctx, current) {
  try {
    return new BooleanNode(ctx, current)
  } catch(error) {
    return null
  }
}
