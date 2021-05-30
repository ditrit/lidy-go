import { isMap, isScalar  } from 'yaml'

export class MergeParser {

  static parse(ctx, rule) {

    // If rule is a scalar
    if (isScalar(rule)) {
      // In case it is a rule_name, return flat_merge on the rule body
      if (typeof(rule.value) == 'string' && ctx.rules.has(rule.value)) {
        return MergeParser.parse(ctx, ctx.rules.get(rule.value, true))
      } else {
        ctx.grammarError(rule, `Error : No rule found named '${rule.value}'`)
        return null
      }
    }

    // If rule is a map
    if (isMap(rule)) {

      // If rule is simple map (no _merge and no _oneOf inside) : nothing to do
      if (!rule.has('_merge') && !rule.has('_oneOf')) {
        return rule
      }      

      // If rule is an alternative (_oneOf)
      if (rule.has('_oneOf')) {
        let oneOfNodeValue = rule.get('_oneOf', true) 
        // 1. recusively apply flat_merge on each alternative
        oneOfNodeValue.items = oneOfNodeValue.items.map(one => MergeParser.parse(ctx, one))
        // 2. reduce nested alternatives
        let idx
        do {
          idx = oneOfNodeValue.items.findIndex((one) => one.has( '_oneOf'))
          if (idx >= 0) {
            let subItems = oneOfNodeValue.items[idx].items
            oneOfNodeValue.items.splice(idx,1)
            oneOfNodeValue.items = oneOfNodeValue.items.concat(subItems)
          }
        } while (idx >= 0)

        return rule
      }

      // if rule is a _merge
      if (rule.has('_merge')) {

        let mergeNodeValue = rule.get('_merge', true)
        let idx
        // insert current map (_map, _mapFacultative and _mapOf) as one map of _merge
        if (rule.has('_map') || rule.has('_mapFacultative') || rule.has('_oneOf')) {
          let new_ele = ctx.dsl_doc.createNode({})
          for (idx = 0; idx < rule.items.length; idx++) {
            let ele = rule.items[idx]
            if (ele.key.value != '_merge') { 
              new_ele.items.push(ele)
              rule.items.splice(idx,1)
            }
          }
          mergeNodeValue.items.push(new_ele)
        }

        // 1. recusively apply flat_merge on each ele
        mergeNodeValue.items = mergeNodeValue.items.map(mergeEle => MergeParser.parse(ctx, mergeEle))
        // 2. reduce nested merges
        do {
          idx = mergeNodeValue.items.findIndex((one) => one.has( '_merge'))
          if (idx >= 0) {
            let subItems = mergeNodeValue.items[idx].items
            mergeNodeValue.items.splice(idx,1)
            mergeNodeValue.items = mergeNodeValue.items.concat(subItems)
          }
        } while (idx >= 0)
        // 3. transform merge(oneOf) into oneOf(merge)
        let rootOneOf = ctx.dsl_doc.createNode({_oneOf:[]})
        let rootOneOfValue = rootOneOf.items[0].value
        do {
          idx = mergeNodeValue.items.findIndex((one) => one.has('_oneOf'))
          if (idx >= 0) {
            let oneOfItems = mergeNodeValue.items[idx].items[0].value.items
            mergeNodeValue.items.splice(idx,1)
            oneOfItems.forEach(ele => {
              let newMergeNode = ctx.dsl_doc.createNode({_merge:[]})
              let newMergeNodeValue = newMergeNode.items[0].value
              newMergeNodeValue.items = [ele].concat(mergeNodeValue.items)
              rootOneOfValue.items.push(newMergeNode)
            })
          }
        } while (idx >=0)

        if (rootOneOfValue.items.length >= 1) {
          return MergeParser.parse(ctx, rootOneOf)
        }

        // 4. DO merge !
        //    Should be a simple flat map
        if (mergeNodeValue.items.some(ele => !isMap(ele) || ele.has('_merge') || ele.has('_oneOf'))) {
          ctx.grammarError(rule, `Error : merge has not been processed successfully. This error should not occur.`)
        }
        let mapNode = ctx.dsl_doc.createNode({_map: {}, _mapFacultative: {}, _mapOf: {}})
        let mapValue = mapNode.get('_map')
        let mapFacultativeValue = mapNode.get('_mapFacultative')
        let mapOfValue = mapNode.get('_mapOf')
        mergeNodeValue.items.forEach(item => {
          let itemNode = item.get('_map', true)
          if (itemNode) { mapValue.items = mapValue.items.concat(itemNode.items) } 
          itemNode = item.get('_mapFacultative', true)
          if (itemNode) { mapFacultativeValue.items = mapFacultativeValue.items.concat(itemNode.items) }
          itemNode = item.get('_mapOf', true) 
          if (itemNode) { 
            if (mapOfValue.items.length == 0) { 
              mapOfValue.items = itemNode.items 
            } else { 
              ctx.grammarError(rule, `Error : only one '_mapOf' is allowed in a '_merge' clause`); return null 
            }  
          } 
        })
        return mapNode
      }

      // This point should not be reached
      ctx.grammarError(rule, `Error : malformed expression into a '_merge'`)
      return null
    }
  }

}
