# Architecture Overview

## Core Components

This library provides two main capabilities:

1. **JSON Schema Definition** - A custom JSON schema for defining various conceptual models (currently: conceptual class model)
2. **Model-Diagram Transformation** - Transforms models into various diagram formats (currently: Mermaid), available through both programmatic API and command-line interface

## Transformation Data Flow

The transformation follows a linear pipeline:

```
[JSON/YAML] → (parser) → [JS object] → (validator) → [typed object] → (converter) → [diagram format]
```

- Validation uses JSON schemas managed by this library.
- This transform pipeline pattern separates parsing concerns from validation and conversion logic, enabling arbitrary combinations of input formats with output formats.

## Module Organization

The codebase separates build-time tooling from runtime library code:

**Build-time (`scripts/`):**
- `build-schemas.ts` - Schema generation pipeline (YAML → TypeScript + JSON)
- Other utilities for development tasks

**Runtime library (`src/`):**
- `src/models/` - Schema definitions for different model types
- `src/processes/` - Process specifications and implementations
- `src/core/` - Core building blocks (parsers, pipeline, validation, types)
- `src/api/` - Public APIs for end users
- `src/cli/` - Command-line interface implementation

## Schema Build System

The schema build workflow generates both TypeScript types and JSON validation schemas from a single YAML source. TypeScript schemas use `as const` assertions because `json-schema-to-ts` requires compile-time schema definitions, not runtime imports.

**Build sequence dependency:** YAML schemas must be built before TypeScript compilation since the generated TypeScript files are imported by the main codebase.

**Version management:** Each schema type maintains independent versioning in `constants.json` rather than using library version numbers. This avoids duplicating unchanged schemas when releasing new library versions.

## Validation Strategy

Ajv uses `strict: true` mode to catch schema authoring errors early. Non-standard keywords like `enumDescriptions` are avoided to maintain JSON Schema Draft 7 compliance and ensure compatibility with standard validation tools.

**Shared validator instance:** A single Ajv instance compiles all schemas to avoid initialization overhead, since validation settings are uniform across the library.

**Error handling:** Validation errors use Ajv's structured error format rather than throwing immediately, allowing complete error collection before failure reporting.
