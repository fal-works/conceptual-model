import * as classModel from "./api/class-model.ts";
import * as internal from "./api/internal.ts";

/**
 * Class model API for transforming YAML/JSON to Mermaid diagrams.
 * Main entry point: `classModel.yamlToMermaid(yaml)` or `classModel.jsonToMermaid(json)`.
 */
export { classModel };

/**
 * Internal building blocks of this library.
 * Not recommended for typical usage - prefer the main APIs above.
 */
export { internal };
