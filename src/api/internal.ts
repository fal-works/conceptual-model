/**
 * Internal building blocks of this library.
 * Not recommended for typical usage.
 */

export { outputTargets } from "../core/output-targets.ts";
export { parseJson, parseYaml } from "../core/parsers.ts";
export { transform } from "../core/pipeline.ts";
export {
	type InputFileFormat,
	type OutputTargetType,
	type ProcessType,
	processToOutputTarget,
} from "../core/types.ts";
export { type ValidationResult, validateData } from "../core/validation.ts";
export * as classModel from "../models/class-model/index.ts";
export { convertToMermaidClassDiagram } from "../processes/mermaid-class-diagram.ts";
