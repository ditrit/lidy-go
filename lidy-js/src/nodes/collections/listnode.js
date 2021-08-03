import { isSeq  } from 'yaml'
import { CollectionNode } from "./collectionnode.js"
  
export class ListNode extends CollectionNode {
  constructor(ctx, current, parsedList) {
    super(ctx, 'list', current)
    if (! parsedList instanceof Array) {
      throw ctx.syntaxError(current, 'Erorr : ListNode must be initialized with an array. This should not happen.')
    }
    this.value = parsedList
    this.childs = this.value
  }

  static checkCurrent(current) {
    // value must be a list
    return isSeq(current)
  }

}

