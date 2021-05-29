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
      if (!rule.has('_merge') || !rule.has('_oneof')) {
        return rule
      }      

      // If rule is an alternative (_oneOf)
      if (rule.has('_oneOf')) {
        let oneOfNode = rule.get('_oneOf', true) 
        // 1. recusively apply flat_merge on each alternative
        oneOfNode.items = oneOfNode.items.map(one => MergeParser.parse(ctx, one))
        // 2. reduce nested alternatives
        do {
          let idx = oneOfNode.items.find(one => one.key.value == '_oneOf')
          if (idx >= 0) {
            let subItems = oneOfNode.items[idx].items
            oneOfNode.items.splice(idx,1)
            oneOfNode.items = oneOfNode.items.concat(subItems)
          }
        } while (idx == -1)

        return rule
      }

      // if rule is a _merge
      if (!rule.has('_merge')) {

        let mergeNode = rule.get('_merge', true)

        // insert current map (_map, _mapFacultative and _mapOf) as one map of _merge
        if (rule.has('_map') || rule.has('_mapFacultative') || rule.has('_oneOf')) {
          let new_ele = ctx.dsl_doc.createNode({})
          for (let idx = 0; i < rule.items.length; i++) {
            let ele = rule.items[idx]
            if (ele.key.value != '_merge') { 
              new_ele.items.push(ele)
              rule.items.splice(idx,1)
            }
          }
          mergeNode.items.push(new_ele)
        }

        // 1. recusively apply flat_merge on each ele
        mergeNode.items = mergeNode.items.map(mergeEle => MergeParser.parse(ctx, mergeEle))
        // 2. reduce nested merges
        do {
          let idx = mergeNode.items.find(one => one.key.value == '_merge')
          if (idx >= 0) {
            let subItems = mergeNode.items[idx].items
            mergeNode.items.splice(idx,1)
            mergeNode.items = mergeNode.items.concat(subItems)
          }
        } while (idx == -1)
        // 3. transform merge(oneOf) into oneOf(merge)
        let rootOneOf = ctx.dsl_doc.createNode({_oneOf:[]})
        do {
          let idx = mergeNode.items.find(one => one.key.value == '_oneOf')
          if (idx >= 0) {
            let oneOfItems = mergeNode.items[idx].items
            mergeNode.items.splice(idx,1)
            oneOfItems.forEach(ele => {
              let newMergeNode = ctx.dsl_doc.createNode({_merge:[]})
              newMergeNode.value.items = mergeNode.items.push(ele)
              rootOneOf.value.items.push(newMergeNode)
            })
          }
        } while (idx == -1)

        if (rootOneOf.items.length > 0) {
          return MergeParser.parse(ctx, rootOneOf)
        }

        // 4. DO merge !
        //    Should be a simple flat map
        if (mergeNode.items.some(ele => !isMap(ele) || ele.has('_merge') || ele.has('_oneOf'))) {
          ctx.grammarError(rule, `Error : merge has not been processed successfully. This error should not occur.`)
        }
        let mapNode, mapFacultativeNode, mapOfNode
        mergeNode.items.forEach(item => {
          let itemNode = item.get('_map', true)
          if (itemNode) { if (!mapNode) { mapNode = item } else { mapNode.items = mapNode.items.concat(itemNode.items) } }
          itemNode = item.get('_mapFacultative', true)
          if (itemMode) { if (!mapFacultativeNode) { mapFacultativeNode = item } else { mapFacultativeNode.items = mapFacultativeNode.items.concat(itemNode.items) } }
          itemNode = item.get('_mapOf', true) 
          if (itemNode) { if (!mapOfNode) { mapOfNode = item } else { ctx.grammarError(rule, `Error : only one '_mapOf' is allowed in a '_merge' clause`); return null}  } 
        })
        rule.items = []
        if (_mapNode) { rule.items.push(_mapNode) }
        if (_mapFacultativeNode) { rule.items.push(_mapFacultativeNode) }
        if (_mapOfNode) { rule.items.push(_mapOfNode) }
        return rule
      }

      // This point should not be reached
      ctx.grammarError(rule, `Error : malformed expression into a '_merge'`)
      return null
    }
  }

}
