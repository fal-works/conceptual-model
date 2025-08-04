/**
 * Fundamental types for the data transformation process.
 */

/**
 * Supported input file formats.
 */
export type InputFileFormat = "json" | "yaml";

/**
 * Type-safe mapping of which models can be converted to which outputs.
 * This is the source of truth for all valid model-to-output combinations.
 */
export type ModelToOutputMapping = {
	"class-model": "mermaid";
};

/**
 * Supported model types that can be processed.
 * Derived from ModelToOutputMapping keys.
 */
export type ModelType = keyof ModelToOutputMapping;

/**
 * Supported output target types.
 * Derived from ModelToOutputMapping values.
 */
export type OutputTargetType = ModelToOutputMapping[keyof ModelToOutputMapping];
