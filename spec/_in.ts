import app from "..";

describe("_in", function () {
  expect(
    app.parse_string(
      "tosca_types.yaml",
      "tosca_definition.yaml",
      "service_template"
    )
  );
});
