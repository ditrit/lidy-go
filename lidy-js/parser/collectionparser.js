import { isMap, isSeq } from 'yaml'

export class CollectionParser {

    static isPositiveInt(nb) {
        return typeof(nb) == 'number' && nb == Math.floor(nb) && nb > 0 
    }
    
    static sizeChecker(ctx, op, nb, current) {
        if (CollectionParser.isPositiveInt(nb)) {
            if (isMap(current) || isSeq(current)) {
                switch (op) {
                    case 'eq':   return current.items.length == nb
                    case 'min':  return current.items.length >= nb
                    case 'max':  return current.items.length <= nb
                }
            } else {
                ctx.syntaxError(current, `Error : a map is expected`)
            }
        } else {
            ctx.grammarError(`Error: the map checker '${op}' does not have a positive integer as value`)
        }
        return false
    }
  

    static sizeCheckers(ctx, rule, current) {
        if (rule._nb != null && !CollectionParser.sizeChecker(ctx, 'eq', rule._nb, current)) { 
          ctx.syntaxError(current, `Error : map expected with ${rule._nb} elements but ${current.items.length} are provided`)
          return false 
        } 
        if (rule._min != null && !CollectionParser.sizeChecker(ctx, 'min', rule._min, current)) { 
          ctx.syntaxError(current, `Error : map expected with more than ${rule._min} elements but ${current.items.length} are provided`)
          return false 
        } 
        if (rule._max != null && !CollectionParser.sizeChecker(ctx, 'max', rule._max, current)) { 
          ctx.syntaxError(current, `Error : map expected with more than ${rule._max} elements but ${current.items.length} are provided`)
          return false 
        }
        return true
    }
}
