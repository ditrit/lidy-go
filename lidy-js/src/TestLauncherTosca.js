import { parse as parse_tosca } from './schemas/tosca.js'
import listener from "./schemas/tosca_listener.js"
import fs from "fs"

export function parse(src) { 
    let src_data = fs.readFileSync(src, 'utf8')
    let res = parse_tosca({src_data, listener})
    return res
}

// Path for debuger
let res2 = parse("./lidy-js/ToscaExample.yml")



if (res2.errors.length > 0) {
    console.log("TOSCA ERROR : ", res2.errors);
} else {
    console.log("Data_types: ", res2.prog.data_types);
    console.log("Node_types: ", res2.prog.node_types);
    console.log(res2.prog.toString());
}
// Path for terminal
// let res2 = parse("../ToscaExample.yml")