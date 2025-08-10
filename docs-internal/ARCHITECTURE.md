# Architecture Overview

This library provides two main capabilities:

1. **JSON Schema Definition** - A custom JSON schema for defining various conceptual models (currently: conceptual class model)
2. **Model-Diagram Transformation** - Transforms models into various diagram formats (currently: Mermaid), available through both programmatic API and command-line interface

## Model-Centric Architecture

The architecture follows a **model-centric approach** where each model type defines its supported input and output formats through importers and exporters:

- **Model Types** define the core data structures and their validation schemas (e.g., "class-model" type has a specific schema and set of importers/exporters)
- **Models** are individual data objects that conform to a model type
- **Importers** convert input formats (e.g. JSON/YAML) into validated model objects of a specific type
- **Exporters** convert model objects into output formats (e.g. Mermaid diagrams)

## Transformation Data Flow

The transformation uses the importer/exporter pattern:

```
[Input Format] → importer() → [Validated Model Object] → exporter() → [Output Format]
```

**Key Characteristics:**
- **Pure Functions**: Importers and exporters are stateless transformation functions
- **Schema Validation**: Importers validate input against JSON schemas and return typed objects
- **Type Safety**: Uses constraint types to ensure correct importer/exporter combinations
- **Composable**: Atomic functions enable flexible composition for different workflows
- **Loose Coupling**: CLI modules connect to library modules only through `src/api/internal.ts`, maintaining architectural separation

## Module Organization

The codebase separates build-time tooling from runtime library code:

**Build-time (`scripts/`):**
- `build-schemas.ts` - Schema generation pipeline (YAML → TypeScript + JSON)
- Other utilities for development tasks

**Runtime library (`src/`):**
- `src/models/` - Model definitions with their importers and exporters
  - `model-spec.ts` - Generic type constraints for importers/exporters
  - `*/importers/` - Input format handlers for each model type
  - `*/exporters/` - Output format handlers for each model type
  - `*/schema-object.ts` - Typed object that is auto-generated from the schema for each model type
- `src/core/` - Core utilities (parsers, validation, type guards)
- `src/api/` - Public APIs for end users
  - `internal.ts` - Single connection point between CLI and library modules (maintains loose coupling)
- `src/cli/` - Command-line interface for end users
  - `command-orchestrator.ts` - Generic command orchestration logic
  - `model-commands/` - Model-specific command handlers

## Schema Build System

The schema build workflow generates both TypeScript types and JSON validation schemas from a single YAML source. TypeScript schemas use `as const` assertions because `json-schema-to-ts` requires compile-time schema definitions, not runtime imports.

**Build sequence dependency:** YAML schemas must be built before TypeScript compilation since the generated TypeScript files are imported by the main codebase.

**Version management:** Each schema type maintains independent versioning in `constants.json` rather than using library version numbers. This avoids duplicating unchanged schemas when releasing new library versions.

## Validation Strategy

Ajv uses `strict: true` mode to catch schema authoring errors early. Non-standard keywords like `enumDescriptions` are avoided to maintain JSON Schema Draft 7 compliance and ensure compatibility with standard validation tools.

**Shared validator instance:** A single Ajv instance compiles all schemas to avoid initialization overhead, since validation settings are uniform across the library.

**Error handling:** Validation errors use Ajv's structured error format rather than throwing immediately, allowing complete error collection before failure reporting.
