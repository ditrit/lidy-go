// import namespace from "../listener/namespace"

export class ToscaProg {
    constructor() {
        this.errors = []
        this.warnings = []
        this.imports = []
        this.alreadyImported = []
        this.service_templates = []
    }

    toStringType(tosca_type) {
        let str = `\n ${tosca_type} : \n`
        for (const key in this[tosca_type]) {
            let node_type = this[tosca_type][key]
            str += `    ${key}: ${node_type}\n`
        }
        return str
    }

    toString() {
        let str = "prog: \n"
        console.log("DEBUG: ", this.service_templates + "\n\n");
        for (const st in this.service_templates) {
            str += st.toString()
        }
        return str
    }
}

export class ToscaNode {
    constructor(source) {
        this.source = source
        this.source.tosca = this
    }
}

export class ToscaType extends ToscaNode {
    constructor(input, source) {
        super(source)
        this.derived_from = input.derived_from
        this.version = input.version
        this.metadata = input.metadata
        this.description = input.description
    }



    setId(name, parsed_rule, category) {
        let current_st = parsed_rule.ctx.prog.current_service_template
        let parent_st = parsed_rule.ctx.prog.current_parent_service_template
        this.name = name
        let namespace_name = current_st.namespace.value

        // dans le current_st
        // current_st[getClassnalme()][current_st.namespace + "/" + name]
        if (current_st[category][namespace_name + "/" + name]) {
            parsed_rule.ctx.grammarError('Type collision : ' + this.import_id)
            console.log("Erreur de collision de type");
        } else {
            current_st[category][namespace_name + "/" + name] = this
            current_st[category][name] = this            
        }

        // dans le parent_st
        // si namspace_uri alors namespace = namespace_uri
        // sinon namespace = namespace
        let namespace = (current_st.ns_uri) ? current_st.ns_uri : namespace_name
        // parents_st[getClassname()][namespace + "/" + name]
        if (parent_st) {
            if (parent_st[category][namespace + "/" + name]) {
                parsed_rule.ctx.grammarError('Type collision : ');
                console.log("Erreur de collision de type");
            } else {
                parent_st[category][namespace + "/" + name] = this
                if (!parent_st[category][name]) {
                    parent_st[category][name] = this
                }
            }

            // si ns_prefix alors 
            // parents_st[getClassname()][prefix + "." + name]
            if (current_st.ns_prefix) {
                if (parent_st[category][current_st.ns_prefix + "." + name]) {
                    parsed_rule.ctx.grammarError('Type collision : ')
                    console.log("Erreur de collision de type");
                } else {
                    parent_st[category][current_st.ns_prefix + "." + name] = this
                    if (parent_st[category][name]) {
                        parent_st[category][name] = this
                    }
                }
            }
        }
    }


    toString() {
        let str
        str += `{name: ${this.name}, \n    `
        str += `    Derived_from: ${this.derived_from}, \n    `
        if (this.version) { str += this.version }
        if (this.description) { str += this.description }
        if (this.metadata) { str += this.metadata }
        return str;
    }
    static isValid(input, source) {
        if (typeof (input.derived_from) != 'string' // || 
        ) {

            return false
        }
        return true
    }
}

export function newToscaType(input, source) {
    let res
    if (ToscaType.isValid(input, source)) {
        res = newToscaType(input, source)
    } else {
        res = {}
    }
    return res
}