import { CollectionNode } from "./collectionnode.js"
import { isMap, isScalar  } from 'yaml'


export class MapNode extends CollectionNode {
  constructor(ctx, current, parsedMap) {
    super(ctx, 'map', current)
    if (typeof(parsedMap) != 'object' || parsedMap instanceof Array) {
      throw ctx.syntaxError(current, 'Erorr : MapNode must be initialized with a parsed map. This should not happen.')
    }
    this.value = parsedMap
    for (const element in parsedMap) {
      this.childs.push(parsedMap[element])
    };
  }

  static checkCurrent(current) {
    // value must be a map whose keys are string
    return isMap(current) && current.items.every(pair => pair.key && isScalar(pair.key) && (typeof(pair.key.value) == 'string' ))
  }

}
