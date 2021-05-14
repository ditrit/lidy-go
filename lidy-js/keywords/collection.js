import { isMap, isScalar  } from 'yaml'

function isPositiveInt(nbNode) {
    return isScalar(nbNode) && nbNode.value instanceof 'number' && nbNode.value == Math.floor(nbNode.value) && nbNode.value > 0 
}

function collectionChecker(ctx, op, nbNode, current) {
    if (isPositiveInt(nbNode)) {
        if (isMap(current)) {
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

export function collectionCheckers(ctx, rule, current) {
    let nbNode = rule.get('_nb')
    if (nbNode != null && !collectionChecker('_nb', nbNode, current)) { 
      ctx.syntaxError(current, `Error : map expected with ${nbNode.value} elements but ${current.items.length} are provided`)
      return false 
    } 
    let minNode = rule.get('_min')
    if (minNode != null && !collectionChecker('_min', minNode, current)) { 
      ctx.syntaxError(current, `Error : map expected with more than ${nbNode.value} elements but ${current.items.length} are provided`)
      return false 
    } 
    let maxNode = rule.get('_max')
    if (minNode != null && !collectionChecker('_max', maxNode, current)) { 
      ctx.syntaxError(current, `Error : map expected with more than ${nbNode.value} elements but ${current.items.length} are provided`)
      return false 
    }
    return true
}
