import { LidyNode } from "../lidynode.js"
import { isScalar  } from 'yaml'

export class BooleanNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'boolean', current)
    this.value = current.value
    if (isScalar(current)) {
      if (["F","f","FALSE","False","false","N","n","NO","No","no","OFF","Off","off"].includes(current.value)) {
        this.value = false
      } else  {
        if (["T","t","TRUE","True","true","Y","y","YES","Yes","yes","ON","On","on"].includes(current.value)) {
          this.value = true
        } else {
          ctx.syntaxError(current, `Error: value '${current.value}' is not a boolean`)
        }
      }
    } else {
      ctx.syntaxError(current, `Error: no boolean value found`)
    }
  }
}
