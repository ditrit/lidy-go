export class LidyNode {
  constructor(ctx, node_type, current) {
    this.ctx = ctx
    this.type = node_type
    this.current = current
    this.start = current.range[0]
    this.end   = current.range[1]
    this.childs = []
  } 

  getChild(nb) { return this.childs[nb]}
  getChildCount() { return this.childs.length }
  getValue() { return this.value }
  toString() { return this.value }

}
