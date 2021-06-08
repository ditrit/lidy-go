import { ScalarNode } from "./scalarnode.js"
import { isScalar  } from 'yaml'

export class TimestampNode extends ScalarNode {
  constructor(ctx, current, date) {
    super(ctx, 'timestamp', current)
    if (TimestampNode.checkCurrent(current)) {
      this.value = new Date(current.value) // lidy-js accepts as timestamp same date format as javascript (simplified ISO8601 format) 
    } else {
      throw ctx.syntaxError(current, `Error: value '${(current) ? current.value : ""}' is not a timestamp in ISO9601 format`)
    }
  }

  static checkCurrent(current) {
    let iso8601regex=/\d{4}-\d{2}-\d{2}|\d{4}-\d{2}?-\d{2}?([Tt]|[ \t]+)\d{2}?:\d{2}:\d{2}(\.\d*)?(([ \t]*)Z|[-+]\d\d?(:\d{2})?)?/
    let ret = isScalar(current) && (typeof(current.value) == 'string') && iso8601regex.test(current.value)
    if (ret == true) {
      try {
        let value = new Date(current.value) // lidy-js accepts as timestamp same date format as javascript (simplified ISO8601 format) 
      } catch (error) { 
        ret = false
      }
    }
    return ret
  }

  static parse(ctx, current) {
    try { return new TimestampNode(ctx, current) 
    } catch (error) {
      return null
    }
  }

  equals(other) {
    if (other instanceof TimestampNode) {
      return this.value.getTime() == other.value.getTime()
    } else {
      return this.ctx.syntaxError('Error : can not compare a timestamp with something else')
    }
  }

}

