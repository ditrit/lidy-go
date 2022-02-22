import { parse } from "./parser/parse.js";

let res = parse("./tests/data/testNomsCourts/A.yml")

if (res.errors.length != 0) {
    console.log("TOSCA ERROR : ");
    res.errors.forEach(e => console.log(e))
} else {
    res.service_templates.forEach(st => {
        console.log("\n-------" + st.origin_file + " -------------------------------------");
        for (const key in st.node_types) {
            console.log("key = " + key.toString());
        }
    });
}