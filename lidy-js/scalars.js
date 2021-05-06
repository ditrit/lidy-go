import { LidyNode } from "./lidynode.js"
import { LidyError } from "./errors.js"
import { isScalar  } from 'yaml'


export class StringNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'string', current)
    if (isScalar(current)) {
      this.value = current.value
    } else {
      ctx.errors.push(new LidyError('SyntaxError', current.range[0], `Error: no string found as value`))
    }
  }
}

export class IntNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'int', current)
    if (isScalar(current)) {
      let number = Number(current.value)
      if (isNaN(number)) {
        ctx.errors.push(new LidyError('SyntaxError', current.range[0], `Error: value '${current.value}' is not a number`))
      } else {
        if (number != Math.floor(number)) {
          ctx.errors.push(new LidyError('SyntaxError', current.range[0], `Error: value '${current.value}' is not an integer`))
        }
      }
      this.value = number
    } else {
      ctx.errors.push(new LidyError('SyntaxError', current.range[0], `Error: no integer found as value`))
    }
  }
}

export class FloatNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'float', current)
    if (isScalar(current)) {
      let number = Number(current.value)
      if (isNaN(number)) {
        ctx.errors.push(new LidyError('SyntaxError', current.range[0], `Error: value '${current.value}' is not a number`))
      } 
      this.value = number
    } else {
      ctx.errors.push(new LidyError('SyntaxError', current.range[0], `Error: no float found as value`))
    }
  }
}

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
          ctx.errors.push(new LidyError('SyntaxError', current.range[0], `Error: value '${current.value}' is not a boolean`))
        }
      }
    } else {
      ctx.errors.push(new LidyError('SyntaxError', current.range[0], `Error: no boolean value found`))
    }
  }
}

export class NullNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'null', current)
    this.value = current.value
    if (isScalar(current)) {
      if ( current.value = null ||  ["Null","NULL","null", "~"].includes(current.value) ) {
        this.value = null
      } else {
        ctx.errors.push(new LidyError('SyntaxError', current.range[0], `Error: value '${current.value}' is not the null value`))
      }
    } else {
        ctx.errors.push(new LidyError('SyntaxError', current.range[0], `Error: null value not found`))
    }
  }
}
