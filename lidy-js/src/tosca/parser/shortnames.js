export default function set_shortnames(prog) {
    prog.service_templates.forEach(cst => {
        let current_namespace = cst.namespace.value;

        // pour chaque categorie de type
        ["node_types"].forEach(category => {
            // RefNomCourt={}
            let short_names = {}
            // Pour chaque Ref dans Refs :
            for (const idx in cst[category]) {
                if (idx.endsWith("pouet")) {
                }
                let idxParts = idx.substring(idx.lastIndexOf('/') + 1).split('.')
                let idxNamespace = idx.substring(0, idx.lastIndexOf('/'))
                // pour NomCourt depuis la fin jusqu'au debut de Ref per '.'
                for (let i = -1, subIdx = "", sep = ""; idxParts.at(i) != null; i--) {
                    subIdx = idxParts.at(i) + sep + subIdx, sep = ".";
                    // si NomCourt pas dans RefNomCourt
                    if (!short_names[subIdx]) {
                        // Calcul nombre de référence
                        let shortNameRefs = Object.keys(cst[category]).filter(ele => ele.endsWith(subIdx))
                        let nb = Object.keys(shortNameRefs).length
                        // si une seule référence pour NomCourt
                        if (nb == 1) {
                            // alors ajouter NomCourt en RefsNomCourt
                            short_names[subIdx] = cst[category][idx]
                        } else if (nb > 1 && idxNamespace == current_namespace) {
                            // sinon si namespace courant et une unique ref avec le namespace courant
                            if (shortNameRefs.filter(ele => ele.startsWith(current_namespace)).length == 1) {
                                // alors ajouter NomCourt en RefRefNomCourt
                                short_names[subIdx] = cst[category][idx]
                            }
                        }
                    }
                }
            }
            // Refs += RefsNomCourt
            Object.assign(cst[category], short_names)
        });
    })
}