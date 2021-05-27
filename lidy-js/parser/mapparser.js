import { MapNode } from "../nodes/collections/mapnode.js"
import { ScalarParser } from "./scalarparser.js"
import { parse_rule } from './parse.js'
import { isPair, isMap, isScalar  } from 'yaml'
import { StringNode } from "../nodes/scalars/stringnode.js"
import { OneOfParser } from "./oneofparser.js"

export class MapParser {

  static flat_merge(ctx, rule) {

    // If rule is a scalar
    if (isScalar(rule)) {
      // In case it is a rule_name, return flat_merge on the rule body
      if (typeof(rule.value) == 'string' && ctx.rules.has(rule.value)) {
        return MapParser.flat_merge(ctx, ctx.rules.get(rule.value, true))
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
        oneOfNode.items = oneOfNode.items.map(one => MapParser.flat_merge(ctx, one))
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
        mergeNode.items = mergeNode.items.map(mergeEle => MapParser.flat_merge(ctx, mergeEle))
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
          return MapParser.flat_merge(ctx, rootOneOf)
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

  static parse(ctx, rule, current) {
    // current value is a map
    if (!MapNode.checkCurrent(current)) {
      ctx.syntaxError(current, `Error : a map whose keys are strings is expected `)
      return null
    }

    if (rule.has('_merge')) {
      rule = MapParser.flat_merge(ctx, rule)
    }
    
    // get values for map _merge keywords 
    if (rule.has('_merge')) {
      rule = MapParser.flat_merge(ctx, rule)
      if (rule.has('_oneOf')) { 
        return !OneOfParser.parse(ctx, rule)
      }
    }

    let mapNode = rule.get('_map', true)
    let mapOfNode = rule.get('_mapOf', true)
    let mapFacultativeNode = rule.get('_mapFacultative', true)
  
    // values for keywords are well formed
    if ((mapNode != null && !isMap(mapNode)) || 
        ((mapOfNode != null && !(isMap(mapOfNode) && mapOfNode.items.length == 1))) || 
        (mapFacultativeNode != null && !isMap(mapFacultativeNode))) {
      ctx.grammarError(current, `Error : error in map value definition`)
      return null
    }

    // quantity checkers are verified
    if (!MapNode.collectionCheckers(ctx, rule, current)) {
      return null
    }

    // every mandatory key (defined for the '_map' keyword) exists
    if (mapNode != null) {
      for (let pair of mapNode.items) { 
        // only maps with string entries are allowed
        if (!((isPair(pair) && isScalar(pair.key) && (typeof(pair.key.value) == 'string')))) {
          ctx.grammarError(current, `Error : error in map definition`)
          return null
        }
        if (! current.has(pair.key.value)) {
          ctx.syntaxError(current, `Error : key '${pair.key.value}' not found in current value`)
          return null
        }
      }
    }
  
    // pair definition for _mapOf 
    let mapOfKey = (mapOfNode) ? mapOfNode.items[0].key : null
    let mapOfValue =  (mapOfNode) ? mapOfNode.items[0].value : null

    let parsedMap = {}

    // for every (key, value) in current, (key: value) matches _map or _mapFacultative or _mapOf 
    for (let pair of current.items) {
      let key = pair.key.value
      let value = pair.value
      let parsedValue = null

      if (mapNode && mapNode.has(key)) {
        parsedValue = parse_rule(ctx, null, mapNode.get(key, true), value)
      } else {
        if (mapFacultativeNode && mapFacultativeNode.has(key)) {
          parsedValue = parse_rule(ctx, null, mapFacultativeNode.get(key, true), value)
        } else {
          if (mapOfNode) {
            let parsedKey = parse_rule(ctx, null, mapOfKey, pair.key)
            parsedValue = parse_rule(ctx, null, mapOfValue, value)
            if (parsedKey != key) {
              ctx.syntaxError(key, `Error : '${key}' does not match expected '${mapOfNode.key}' type`)
              return null
            }
          } else {
            ctx.syntaxError(value, `Error : '${key}' is not a valid key`)
            return null
          }
        }
      }
      if (parsedValue == null) {
        ctx.syntaxError(value, `Error : bad value '${value}'found for '${key}'`)
        return null
      }
      let parsedKey = new StringNode(ctx, pair.key)
      parsedValue.key = parsedKey
      if (parsedMap[key] != null) {
        ctx.syntaxError(value, `Error : more than one value provided in the map for the key '${key}'`)
        return null
      }
      parsedMap[key] = parsedValue
    }

    // everything is ok
    return new MapNode(ctx, current, parsedMap)
  }

  static parse_any(ctx, current) {
    // current value is a map whose keys are strings
    if (!MapNode.checkCurrent(current)) {
      ctx.syntaxError(current, `Error : a map whose keys are strings is expected `)
      return null
    }

    // parse every item of the map as 'any'
    let parsedMap = {}
    current.items.forEach(pair => {
      let key = pair.key.value
      let value = pair.value
      let parsedValue = ScalarParser.parse_any(ctx, value)
      if (parsedValue == null) {
        ctx.syntaxError(value, `Error : bad value '${value}'found for '${key}'`)
        return null
      }
      let parsedKey = new StringNode(ctx, pair.key)
      parsedValue.key = parsedKey
      if (parsedMap[key] != null) {
        ctx.syntaxError(value, `Error : more than one value provided in the map for the key '${key}'`)
      }
      parsedMap[key] = parsedValue
    })

    // everything is ok
    return new MapNode(ctx, current, parsedMap)
  }
}
