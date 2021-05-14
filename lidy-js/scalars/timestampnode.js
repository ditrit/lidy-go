import { LidyNode } from "../lidynode.js"
import { isScalar  } from 'yaml'

export class TimestampNode extends LidyNode {
  constructor(ctx, current, date) {
    super(ctx, 'timestamp', current)
    let iso8601regex=/\d{4}-\d{2}-\d{2}|\d{4}-\d{2}?-\d{2}?([Tt]|[ \t]+)\d{2}?:\d{2}:\d{2}(\.\d*)?(([ \t]*)Z|[-+]\d\d?(:\d{2})?)?/
    this.value = null
    try {
      this.value = new Date(current.value) // lidy-js accepts as timestamp same date format as javascript (simplified ISO8601 format) 
    } catch (error) { 
      date.value = null 
    }
    if (this.value == null) {
      let e = ctx.syntaxError(current, `Error: value '${(current) ? current.value : ""}' is not a timestamp in ISO9601 format`)
      throw (e)
    }
  }
}

export function newTimestampNode(ctx, current) {
  try {
    return new TimestampNode(ctx, current)
  } catch(error) {
    return null
  }
}
