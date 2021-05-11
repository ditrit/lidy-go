import { LidyNode } from "./lidynode.js"
import { isScalar  } from 'yaml'


export class StringNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'string', current)
    if (isScalar(current)) {
      this.value = current.value
      if (typeof(this.value) != 'string') {
        ctx.syntaxError(current, `Error: value '${this.value}' is a '${typeof(this.value)}', not a string`)
      }
    } else {
      ctx.syntaxError(current, `Error: no string found as value`)
    }
  }
}

export class TimestampNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'timestamp', current)
    this.value = null
    try {
          this.value = new Date(current.value) // lidy-js accepts as timestamp same date format as javascript (simplified ISO8601 format) 
    } catch (error) { }
    if (! (this.value instanceof Date)) {
      ctx.syntaxError(current, `Error: value '${(current) ? current.value : ""}' is not a timestamp in ISO9601 format`)
    }
  }
}

export class Base64Node extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'timestamp', current)
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

export class IntNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'int', current)
    if (isScalar(current)) {
      let number = Number(current.value)
      if (isNaN(number)) {
        ctx.syntaxError(current, `Error: value '${current.value}' is not a number`)
      } else {
        if (number != Math.floor(number)) {
          ctx.syntaxError(current, `Error: value '${current.value}' is not an integer`)
        }
      }
      this.value = number
    } else {
      ctx.syntaxError(current, `Error: no integer found as value`)
    }
  }
}

export class FloatNode extends LidyNode {
  constructor(ctx, current) {
    super(ctx, 'float', current)
    if (isScalar(current)) {
      let number = Number(current.value)
      if (isNaN(number)) {
        ctx.syntaxError(current, `Error: value '${current.value}' is not a number`)
      } 
      this.value = number
    } else {
      ctx.syntaxError(current, `Error: no float found as value`)
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
          ctx.syntaxError(current, `Error: value '${current.value}' is not a boolean`)
        }
      }
    } else {
      ctx.syntaxError(current, `Error: no boolean value found`)
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
        ctx.syntaxError(current, `Error: value '${current.value}' is not the null value`)
      }
    } else {
        ctx.syntaxError(current, `Error: null value not found`)
    }
  }
}
