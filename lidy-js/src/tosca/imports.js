import { ToscaNode } from './prog.js'
import path from 'path'


export class ToscaImport extends ToscaNode {
    constructor(input, source) {
        super(source)
        this.file = input.file
        this.currentPath = (input.currentPath) ? input.currentPath : ""
        this.setAbsolutePath()
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

    
    setAbsolutePath() {
        this.path  = ""
        if (this.repository && this.repository != "") {
            this.path = `${this.source.ctx.prog.repositories[this.repository].getFullUrl()}:`
        } else { 
            this.path = (!this.file.match(/^[a-zA-Z]*:\/\//) || !this.file[0] == '/') ? 
                this.currentPath + '/' + this.file : 
                this.file   
        }
        if (this.path.match(/^[a-zA-Z]*:\/\//)) {
        } else {
            this.path = path.resolve(this.path)
        }
        
        this.currentPath = path.dirname(this.path)
        this.source.ctx.prog.currentPath = this.currentPath
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
