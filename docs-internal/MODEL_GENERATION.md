# Model Generation Guidelines

## Conceptual Class Model

When generating example models, follow these guidelines:

- General
    - Generate valid YAML against schema `@docs/schema/v0.x/class-model.json`
    - Begin YAML with modeline: `# yaml-language-server: $schema=../docs/schema/v0.x/class-model.json`
    - Minimize quotes - quote only to avoid YAML syntax errors
- Groups
    - Avoid using groups unless necessary
    - When using groups, ensure each node belongs to at most one group
- Nodes
    - Add attributes sparingly - only for most essential ones, prefer separate classes
- Edges
    - Property order:
        - `source`
        - `relation`
        - `label` (optional, only if special meaning)
        - `multiplicity` (optional)
        - `target`
    - Specify the source multiplicity of an edge only if it is not "1"
    - Use appropriate relations:
        - `is-a`: inheritance (Car is-a Vehicle)
        - `is-composed-of`: composition, target cannot exist without source (House is-composed-of Room)
        - `aggregates`: aggregation, target can exist independently (Department aggregates Professor)
        - `refers-to`: reference/navigable association (Student refers-to Advisor)
        - `to`: general directional association (use only when other types are not appropriate)
        - `with`: general bidirectional/nondirectional association (use only when other types are not appropriate)
