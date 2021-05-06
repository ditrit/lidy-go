import { YAMLError } from 'yaml'

export class LidyError extends YAMLError {
    constructor(name, pos, message) {
        super(name, pos, 'IMPOSSIBLE', message);
        this.lidyCode = code
    }

    pretty(ctx) {
        this.linePos = ctx.lineCounter.linePos(pos)
        const { line, col } = this.linePos
        this.message += ` at line ${line}, column ${col}`;
    }
}

