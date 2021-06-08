import { YAMLError } from 'yaml'

export class LidyError extends YAMLError {
    constructor(name, pos, message) {
        super(name, pos, 'IMPOSSIBLE', message);
        this.name = name
    }

    pretty(ctx) {
        this.linePos = ctx.lineCounter.linePos(this.pos)
        const { line, col } = this.linePos
        this.message += ` at line ${line}, column ${col}`;
    }
}

