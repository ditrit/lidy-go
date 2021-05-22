import { isSeq  } from 'yaml'
import { CollectionNode } from "./collectionnode.js"
import { parse_rule } from '../../parse.js'
  
export class ListNode extends CollectionNode {
  constructor(ctx, current) {
    super(ctx, 'list', current, parsedList)
    this.parsedList = this.parsedList
  }

  static checkCurrent(current) {
    // value must be a list
    return isSeq(current)
  }

  static parse(ctx, rule, current) {
    // current value is a list
    if (!checkCurrent(current)) {
      ctx.syntaxError(current, `Error : a list is expected `)
      return null
    }
  
    // quantity checkers are verified
    if (!listNode.collectionCheckers(ctx, rule, current)) {
      return null
    }
    
    // get values for llist keywords 
    let listNode = rule.get('_list')
    let listOfNode = rule.get('_listOf')
    let listFacultativeNode = rule.get('_listFacultative')
    
    // values for keywords are lists if not null
    if ((listNode != null && !isSeq(listNode)) || (listOfNode != null && !isSeq(listOfNode)) || (listFacultativeNode != null && !isSeq(listFacultativeNode))) {
      ctx.grammarError(current, `Error : error in list value definition`)
      return null
    }
  
    let idx = 0
    let nbItems = current.items.length
    let parsedItems = []

    // parse mandatory items 
    if (listNode) {
      listNode.items.for(lidyItem => { 
        if (idx < nbItems) {
          let newEle = parse_rule(ctx, null, lidyItem, current.items[idx])
          if (newEle == null) {
            ctx.syntaxError(current, `Error : can node parse an element of the list`)
            return null
          } else {
            parsedItems.push(newEle)
          }
        } else {
          ctx.syntaxError(current, `Error : mandatory elements missing in the list`)
          return null
        }
        idx += 1
      })
    }

    // parse optional elements 
    let tmpErrors = [].concat(ctx.errors)
    let tmpWarnings = [].concat(ctx.warnings)
    if (listFacultativeNode) {
      listFacultativeNode.items.for(lidyItem => {
        if (idx < nbItems) {
          let newEle = parse_rule(ctx, null, lidyItem, current.items[idx])
          if (newEle != null) {
            parsedItems.push(newEle)
            idx += 1
          }
        }
      })
    }
    
    // parse listOf elements
    if (listOfNode != null) {
      for (; idx < nbItems; i++) {
        let newEle = parse_rule(ctx, null, listOfNode, current.items[idx])
        if (newEle == null) {
          ctx.syntaxError(current, `Error : wrong type for an element in a list`)
          return null
        } else {
          parsedItems.push(newEle)
        }
      }
    }

    // every element of the current list should have been parsed
    if (idx < nbItems) {
      ctx.syntaxError(current, `Error : too more elements in the list`)
      return null
    }

    // if everything is ok, errors have to be cleaned of errors throwed during optional elements parsing
    ctx.errors = tmpErrors
    ctx.warnings = tmpWarnings

    return new ListNode(ctx, current, parsedItems)
  }

  static parse_any(ctx, current) {
    // current value is a list whose keys are strings
    if (!checkCurrent(current)) {
      ctx.syntaxError(current, `Error : a list whose keys are strings is expected `)
      return null
    }

    let parsedList = {}
    current.items.forEach(item => {
      let parsedValue = parse_any(ctx, item)
      if (parsedValue == null) {
        ctx.SyntaxError(value, `Error : bad value '${value}'found for '${key}'`)
        return null
      }
      parsedItems.push(parsedValue)
    })
    return new listNode(ctx, current, parsedList)
  }
}

