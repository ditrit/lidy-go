import { LidyError } from './errors.js'
import { LineCounter } from 'yaml'

export class Ctx {
    constructor() {
        this.lineCounter = new LineCounter()
        this.src = ""
        this.txt = ""
        this.errors   = []
        this.warnings = []
        this.yaml_ok  = false
        this.contents = null
    }

    errors(newErrors) {
        this.errors = this.errors.concat(newErrors)
    }

    warnings(newWarnings) {
        this.warnings = this.warnings.concat(newWarnings)
    }

    fileError(message) {
        this.errors.push(new LidyError('FILE_ERROR', 0, `FileError : ${message}`))
    }

    syntaxError(current, message) {
        this.errors.push(new LidyError('SYNTAX_ERROR', (current.range) ? current.range[0] : 0, `SyntaxError : ${message}`))
    }
    
    syntaxWarning(current, message) {
        this.warnings.push(new LidyError('SYNTAX_WARNING', (current.range) ? current.range[0] : 0, `SyntaxWarning : ${message}`))
    }

    grammarError(current, message) {
        this.errors.push(new LidyError('GRAMMAR_ERROR', (current.range) ? current.range[0] : 0, `GrammarError : ${message}`))
    }
    
    grammarWarning(current, message) {
        this.warnings.push(new LidyError('GRAMMAR_WARNING', (current.range) ? current.range[0] : 0, `GrammarWarning : ${message}`))
    }

}
