class ToscaProg {
    constructor() {
        this.nodes = {}
    }
}

class ToscaNode {
    constructor(name, parent_type, source) {
        this.parent_type = parent_type.value
        this.name = name
        this.source = source
    }
}


function exit_node_types(parsed_rule) {
    console.log("Sortie de NodtType");
    console.log(parsed_rule);
    for (const key in parsed_rule.value) {
        let val = parsed_rule.value[key]
        let node = new ToscaNode(key, val.value.derived_from, val)
        val.tosca = node
        parsed_rule.ctx.prog.nodes[key] = node
    }
}

function enter_main(current) {
    console.log("Entrée dans main")
    current.ctx.prog = new ToscaProg()
    console.log(current);
    
}

function exit_main(parsed_rule) {
    console.log("Fin de l'analyse");
    console.log(parsed_rule.ctx.prog);
}

export default {exit_node_types, enter_main, exit_main}