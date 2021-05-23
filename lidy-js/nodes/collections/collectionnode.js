import { isMap, isScalar, isSeq  } from 'yaml'
import { LidyNode } from '../lidynode.js'

function isPositiveInt(nbNode) {
    return isScalar(nbNode) && typeof(nbNode.value) == 'number' && nbNode.value == Math.floor(nbNode.value) && nbNode.value > 0 
}

function collectionChecker(ctx, op, nbNode, current) {
    if (isPositiveInt(nbNode)) {
        if (isMap(current) || isSeq(current)) {
            switch (op) {
                case '_nb':   return current.items.length == nbNode.value
                case '_min':  return current.items.length >= nbNode.value
                case '_max':  return current.items.length <= nbNode.value
            }
        } else {
            ctx.syntaxError(current, `Error : a map is expected`)
        }
    } else {
        ctx.grammarError(current, `Error: the map checker '${op}' does not have a positive integer as value`)
    }
    return false
}

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

  static collectionCheckers(ctx, rule, current) {
    let nbNode = rule.get('_nb', true)
    if (nbNode != null && !collectionChecker(ctx, '_nb', nbNode, current)) { 
      ctx.syntaxError(current, `Error : map expected with ${nbNode.value} elements but ${current.items.length} are provided`)
      return false 
    } 
    let minNode = rule.get('_min', true)
    if (minNode != null && !collectionChecker(ctx, '_min', minNode, current)) { 
      ctx.syntaxError(current, `Error : map expected with more than ${minNode.value} elements but ${current.items.length} are provided`)
      return false 
    } 
    let maxNode = rule.get('_max', true)
    if (maxNode != null && !collectionChecker(ctx, '_max', maxNode, current)) { 
      ctx.syntaxError(current, `Error : map expected with more than ${maxNode.value} elements but ${current.items.length} are provided`)
      return false 
    }
    return true
  }
}
