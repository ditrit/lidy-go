export class LidyNode {
    constructor(ctx, node_type, current, value=null) {
      this.type = node_type
      this.current = current
      this.start = current.range[0]
      this.end   = current.range[1]
      this.value = value
      this.childs = []
    }
    getChild(nb) { return this.childs[nb]}
    getChildCount() { return this.childs.length }
    toString() { return this.value }
  }
  