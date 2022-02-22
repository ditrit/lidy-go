// import prog from "../listener/prog"
import { ToscaNode } from './prog.js'

export class ToscaRepository extends ToscaNode {
    constructor(input, source) {
        super(source)
        this.name = input.name
        this.url = input.url
        this.description = input.description
        if(input.token) { // creation of credential object
            this.token = input.token
            this.prototol = input.prototol
            this.token_type = input.token_type
            this.user = input.user
        }
    }
    toString() {
        return `{Name: ${this.name},\n      Url: ${this.url}, \n      Descrption: ${this.description}, \n      Token: ${this.token}, \n      Protocol: ${this.prototol}, \n      Token_type: ${this.token_type}, \n      User: ${this.user}}\n`
        // return `test: ${this.url}`
    }
    static isValid(input, source) {
        if(typeof(input.name) != 'string' ||
           input.name == "" ||
           typeof(input.url) != 'string' ||
           typeof(input.description) != 'string' ||
           typeof(input.token) != 'string' ||
           typeof(input.prototol) != 'string' ||
           typeof(input.token_type) != 'string' ||
           typeof(input.user) != 'string') {

            source.ctx.grammarError('Incorrect input for repository')
            return false
        }
        return true
    }
    getFullUrl() {
        let res
        (this.prototol) ? res += `${this.protocol}://` : "https://"
        if(this.user) {res += `${this.user}:`}
        if(this.token) { res+= `${this.token}@`}
        res += url
        return res
    }
}

export function newToscaRepository(input, source) {
    let res
    if (ToscaRepository.isValid(input, source)) {
        res = new ToscaRepository(input, source)
    } else {
        res = {}
    }
    return res
}
