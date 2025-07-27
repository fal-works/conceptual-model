/**
 * Fundamental types for the data transformation process.
 */

/**
 * Supported input file formats.
 */
export type InputFileFormat = "json" | "yaml";

/**
 * Supported process types (model validation and conversion combinations).
 */
export type ProcessType = "class-model-to-mermaid";

/**
 * Supported output target types.
 */
export type OutputTargetType = "mermaid";

/**
 * Mapping from process type to output target type.
 */
export const processToOutputTarget: Record<ProcessType, OutputTargetType> = {
	"class-model-to-mermaid": "mermaid",
};
