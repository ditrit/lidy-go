import { isScalarType } from './utils.js'

export class MergeParser {

  static parse(ctx, rule) {

    // If rule is a scalar
    if (isScalarType(rule)) {
      // In case it is a rule_name, return flat_merge on the rule body
      if (typeof(rule) == 'string' && ctx.rules[rule]) {
        return MergeParser.parse(ctx, ctx.rules[rule])
      } else {
        ctx.grammarError(rule, `Error : No rule found named '${rule}'`)
        return null
      }
    }

    // If rule is a map
    if (typeof(rule) == 'object') {

      // If rule is simple map (no _merge and no _oneOf inside) : nothing to do
      if (!rule._merge && !rule._oneOf) {
        return rule
      }      

      // If rule is an alternative (_oneOf)
      if (rule._oneOf) {
        if (!rule._oneOf instanceof Array) {
          ctx.grammarError(`Error : _oneof value have to be a list`)
        }
        // 1. recusively apply flat_merge on each alternative
        rule._oneOf = rule._oneOf.map(one => MergeParser.parse(ctx, one))
        // 2. reduce nested alternatives
        let idx
        do {
          idx = rule._oneOf.findIndex((one) => one._oneOf)
          if (idx >= 0) {
            let subItems = rule._oneOf[idx]._oneOf
            rule = {_oneOf: [].concat(rule._oneOf)}
            rule._oneOf.splice(idx,1)
            rule._oneOf = rule._oneOf.concat(subItems)
          }
        } while (idx >= 0)

        return rule
      }

      // if rule is a _merge
      if (rule._merge) {
        if (!rule._merge instanceof Array) {
          ctx.grammarError(rule, `Error : _merge value have to be a map`)
          return null
        }
        let newMap = {}
        let n = 0
        [ '_map', '_mapFacultative', '_mapOf', '_nb', '_min','_max'].forEach(
          (key) => { if (rule[key]) { newMap[key] = rule[key], n++ } })
        let rule = { _merge: rule._merge }
        if (n> 0) {
          rule._merge.push(newMap)
        }

        // 1. recusively apply flat_merge on each ele
        rule._merge = rule._merge.map(mergeEle => MergeParser.parse(ctx, mergeEle))
        // 2. reduce nested merges
        do {
          idx = rule._merge.findIndex((one) => one._merge)
          if (idx >= 0) {
            let subItems = rule.one._merge
            rule = {_merge: [].concat(rule._merge)}
            rule._merge.splice(idx,1)
            rule._merge = rule._merge.concat(subItems)
          }
        } while (idx >= 0)
        // 3. transform merge(oneOf) into oneOf(merge)
        let rootOneOf = {_oneOf:[]}
        do {
          rule = [].concat(rule)
          idx = rule._merge.findIndex((one) => one._oneOf)
          if (idx >= 0) {
            let oneOfItems = one._oneOf
            rule = {_merge: [].concat(rule._merge)}
            rule._merge.splice(idx,1)
            oneOfItems.forEach(ele => {
              let newMergeNode = {_merge: [ele].concat(mergeNodeValue.items) }
              rootOneOf._oneOf.push(newMergeNode)
            })
          }
        } while (idx >=0)

        if (rootOneOf._oneOf.length >= 1) {
          return MergeParser.parse(ctx, rootOneOf)
        }

        // 4. DO merge !
        //    Should be a simple flat map
        if (rule._merge.some(ele => ele._merge || ele._oneOf)) {
          ctx.grammarError(rule, `Error : merge has not been processed successfully. This error should not occur.`)
        }
        let mapValue = {}
        let mapFacultativeValue = {}
        let mapOfValue = null
        let nb = min = max = -1
        rule._merge.forEach(item => {
          if (item._map) { mapValue = mapValue.concat(item._map) } 
          if (item._mapFacultative) { mapFacultativeValue = mapFacultativeValue.concat(item._mapFacultative) }
          if (item._mapOf) { 
            if (mapOfValue == null) { 
              mapOfValue = item._mapOf 
            } else { 
              ctx.grammarError(rule, `Error : only one '_mapOf' is allowed in a '_merge' clause`); return null 
            }  
          } 
          if (item._nb) { if (nb < 0 || nb == item._nb) { nb = item._nb } else { ctx.grammarError(`Contradictory sizing in merge clause`) }}
          if (item._min) { min = Math.max(item._min, min) }
          if (item._max) { nax = (nb>0) ? Math.min(item._max, max) : item._max }
        })
        let result = {}
        if (nb >= 0) result._nb = nb
        if (min >= 0) result._min = min
        if (max >= 0) result._max = max
        if (Object.entries(mapValue).length > 0) result._map = mapValue
        if (Object.entries(mapFacultativeValue).length > 0) result._mapFacultative = mapFacultativeValue
        if (mapOfValue != null) result._mapOf = mapOfValue

        return result
      }

      // This point should not be reached
      ctx.grammarError(rule, `Error : malformed expression into a '_merge'`)
      return null
    }
  }

}
