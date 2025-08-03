# Model Generation Guidelines

## Conceptual Class Model

When generating example models, follow these guidelines:

- General
    - Generate valid YAML against schema `@docs/schema/v0.x/class-model.json`
    - Begin YAML with modeline: `# yaml-language-server: $schema=../docs/schema/v0.x/class-model.json`
    - Omit properties marked "not used ..." in schema
    - Minimize quotes - quote only to avoid YAML syntax errors
- Nodes
    - Add attributes sparingly - only for essential ones, prefer separate classes
- Edges
    - Property order:
        - `source`
        - `relation`
        - `label` (optional, only if special meaning)
        - `target`
        - `multiplicity` (optional)
    - Specify the source multiplicity of an edge only if it is not "1"
    - Use appropriate relations:
        - `is-a`: inheritance (Car is-a Vehicle)
        - `is-composed-of`: composition, target cannot exist without source (House is-composed-of Room)
        - `aggregates`: aggregation, target can exist independently (Department aggregates Professor)
        - `links-to`: weak association, indirect reference (Student links-to Advisor)
