import { ToscaNode } from './prog.js'
import path from 'path'

export class ToscaImport extends ToscaNode {
    constructor(input, source) {
        super(source)
        this.file = input.file
        this.currentPath = input.currentPath
        this.path = this.getAbsolutePath()
        this.pathDir = path.dirname(this.path)
        this.repository = input.repository 
        this.namespace_prefix = input.namespace_prefix 
        this.namespace_uri = input.namespace_uri 
    }
    toString() {
        return `\n    {Path: ${this.path}, \n    Repository: ${this.repository}, \n    Namespace_prefix: ${this.namespace_prefix}, \n    Namespace_uri: ${this.namespace_uri}}\n`
    }
    static isValid(input, source) {
        if (typeof(input.file) != 'string' || input.file == "") {
            source.ctx.grammarError('Incorrect file input for import')
            return false        
        }
        if (typeof(input.repository) != 'string' || 
            typeof(input.namespace_prefix) != 'string' || 
            typeof(input.namespace_uri) != 'string') {
            
            source.ctx.grammarError('Incorrect file input for import')
            return false
        }
        return true
    }

    getAbsolutePath() {
        let res = ""
        if (this.repository && this.repository != "") {
            res = this.source.ctx.prog.repositories[this.repository].getFullUrl()
            let fullPath = path.resolve(this.file)
            res += `:${fullPath}`
        } else { 
            if (this.file[0] == '.') {
                this.file = this.currentPath + '/' + this.file
            }
            let fullPath = path.resolve(this.file)
            res += `${fullPath}`
        }
        console.log(`AbsolutePathResult: ${res}`);
        return res
    }
}

export function newToscaImport(input, source) {
    let res
    if (ToscaImport.isValid(input, source)) {
        res = new ToscaImport(input, source)
    } else {
        res = {}
    }
    return res
}

// export function getAbsolutePath(importObj, source) {
//     let res
//     if (importObj.repository) {
//         res = source.ctx.prog.repositories[importObj.repository].getFullUrl()
//         res += `:${importObj.file}`
//     } else {
//         res = importObj.file
//     }
//     return res
// }
// export default { ToscaImport, newToscaImport }