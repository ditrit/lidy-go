import { LidyNode } from '../lidynode.js'


export class CollectionNode extends LidyNode {
  constructor(ctx, collectionType, current) {
    super(ctx, collectionType, current)
  }

  length() {
    return this.childs.length
  }
  isEmpty() {
    return this.length() == 0
  }

  
}
