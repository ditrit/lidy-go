import { isScalarType } from './utils.js'

export class MergeParser {

  static parse(ctx, rule) {

    // If rule is a map
    if (typeof(rule) == 'object') {

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
        if (!(rule._merge instanceof Array)) {
          ctx.grammarError(`Error : _merge value have to be a map`)
          return null
        }

        // embed external map as one of ele of merge
        const {_merge, ...newMap} = rule
        rule = { _merge: rule._merge }
        if (Object.keys(newMap).length) {
          rule._merge.push(newMap)
        }

        // if rule_name in _merge eles, substitute it
        rule._merge = rule._merge.map(ele => (isScalarType(ele) && ctx.rules[ele]) ? ctx.rules[ele] : ele )

        let idx
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
          rule = {_merge: [].concat(rule._merge) }
          idx = rule._merge.findIndex((one) => one._oneOf)
          if (idx >= 0) {
            let oneOfItems = rule._merge[idx]._oneOf
            rule = {_merge: [].concat(rule._merge)}
            rule._merge.splice(idx,1)
            oneOfItems.forEach(ele => {
              let newMergeNode = {_merge: [ele].concat(rule._merge) }
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
          ctx.grammarError(`Error : merge has not been processed successfully. This error should not occur.`)
        }
        let mapValue = {}
        let mapFacultativeValue = {}
        let mapOfValue = null
        let nb=-1, min=-1, max = -1
        rule._merge.forEach(item => {
          if (item._map) { 
            mapValue = { ...mapValue }
            for (let key in item._map) {
              if (mapValue.key) {ctx.grammarError(`Error : can not merge two maps with some identical keys`)}
              mapValue[key] = item._map[key]
            } 
          } 
          if (item._mapFacultative) { 
            mapFacultativeValue = { ...mapFacultativeValue }
            for (let key in item._mapFacultative) {
              if (mapFacultativeValue.key) {ctx.grammarError(`Error : can not merge two maps with some identical keys`)}
              mapFacultativeValue[key] = item._mapFacultative[key]
            }
          }
          if (item._mapOf) { 
            if (mapOfValue == null) { 
              mapOfValue = item._mapOf 
            } else { 
              ctx.grammarError(`Error : only one '_mapOf' is allowed in a '_merge' clause`); return null 
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
        if (Object.keys(mapValue).length > 0) result._map = mapValue
        if (Object.keys(mapFacultativeValue)
        .length > 0) result._mapFacultative = mapFacultativeValue
        if (mapOfValue != null) result._mapOf = mapOfValue

        return result
      }

      if (rule._map) {
        let newMap = {}
        for (const key in rule._map) {
          newMap[key] = MergeParser.parse(ctx, rule._map[key])
        }
        rule._map = newMap 
      }

      if (rule._mapFacultative) {
        let newMap = {}
        for (const key in rule._mapFacultative) {
          newMap[key] = MergeParser.parse(ctx, rule._mapFacultative[key])
        }
        rule._mapFacultative = newMap 
      }

      if (rule._mapOf) {
        let newMap = {}
        for (const keyExpr in rule._mapOf) {
          let key = MergeParser.parse(ctx, keyExpr)
          let val = MergeParser.parse(ctx, rule._mapOf[keyExpr])
          newMap[key] = val
        }
        rule._mapOf = newMap 
      }

      if (rule._list) {
        rule._list = rule._list.map(ele => MergeParser.parse(ctx, ele))
      }

      if (rule._listFacultative) {
        rule._listFacultative = rule._listFacultative.map(ele => MergeParser.parse(ctx, ele))
      }

      if (rule._listOf) {
        rule._listOf = MergeParser.parse(ctx, rule._listOf)
      }

    }
    return rule

  }

}


