import { CollectionNode } from "./collectionnode.js"
import { isMap, isScalar  } from 'yaml'


export class MapNode extends CollectionNode {
  constructor(ctx, current, parsedMap) {
    super(ctx, 'map', current)
    this.value = parsedMap
  }

  static checkCurrent(current) {
    // value must be a map whose keys are string
    return isMap(current) && current.items.every(pair => pair.key && isScalar(pair.key) && (typeof(pair.key.value) == 'string' ))
  }

}
