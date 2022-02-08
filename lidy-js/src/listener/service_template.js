export default {
    exit_service_template(parsed_rule) {
        let val = parsed_rule.value
        let cst = parsed_rule.ctx.prog.current_service_template
        
        cst.tosca_definitions_version = val.tosca_definitions_version?.value
        cst.description = val.description?.value.tosca
        cst.metadata = val.metadata?.value.tosca

        // for (const idx in cst.node_types) {
        //     parts = idx.substring(str.lastIndexOf('/')+1).split('.')
        //     let idxs = []
        //     for(i=0, subIdx="", sep=""; 
        //         parts.at(i)!=null;
        //         i--, subIdx=parts.at(i)+ sep + subIdx, sep=".") { 
        //         // si Filter
                
        //             // idxs.push(subIdx)
        //     }

        //     idxs.forEach(part => {
        //         if (node.filter(x => x.endsWith(part).length == 1)) {
        //             node.push(part)
        //         }
        //     });
                
            // }
        // }
    }
}