import { ToscaProg } from '../model/prog.js';
import parse_file from './prog_init.js';
import set_shortnames from './shortnames.js';

export function parse(src) {
        let prog = new ToscaProg()
        parse_file(src, "", "", null, prog)
        set_shortnames(prog)
        return prog
    }