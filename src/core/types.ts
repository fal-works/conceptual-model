/**
 * Fundamental types for the data conversion process.
 */

/**
 * Supported input file formats.
 */
export type InputFileFormat = "json" | "yaml";

/**
 * Supported conversion types (model-to-output combinations).
 */
export type ConversionType = "class-model-to-mermaid";

/**
 * Supported output target types.
 */
export type OutputTargetType = "mermaid";

/**
 * Mapping from conversion type to output target type.
 */
export const conversionToOutputTarget: Record<ConversionType, OutputTargetType> = {
	"class-model-to-mermaid": "mermaid",
};
