import type { ModelToOutputMapping, ModelType } from "../core/types.ts";
import { convertToMermaidClassDiagram } from "./mermaid-class-diagram.ts";
import type { ConverterFunction, ConverterRegistry, ModelFromType } from "./types.ts";

export type { ModelFromType } from "./types.ts";

/**
 * Registry of all model converters.
 * Maps model types and output formats to their converter functions.
 */
export const converters: ConverterRegistry = {
	"class-model": {
		mermaid: convertToMermaidClassDiagram,
	},
};

/**
 * Gets a converter function for a specific model type and output format.
 * @param modelType - The type of model to convert
 * @param outputTarget - The desired output format
 * @returns The converter function
 */
export function getConverter<T extends ModelType, O extends ModelToOutputMapping[T]>(
	modelType: T,
	outputTarget: O,
): ConverterFunction<ModelFromType<T>> {
	return converters[modelType][outputTarget as keyof (typeof converters)[typeof modelType]];
}
