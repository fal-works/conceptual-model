import type { ModelToOutputMapping, ModelType } from "../core/types.ts";
import { convertToMermaidClassDiagram } from "./mermaid-class-diagram.ts";
import type {
	ConverterFunction,
	ConverterOptionsType,
	ConverterRegistry,
	ModelFromType,
} from "./types.ts";

export type { ConverterOptionsType, ModelFromType } from "./types.ts";

/**
 * Registry of all model converters.
 * Maps model types and output formats to their converter functions.
 * `ConverterRegistry` type enforces that structure matches ModelToOutputMapping exactly.
 */
export const converters: ConverterRegistry = {
	"class-model": {
		mermaid: convertToMermaidClassDiagram,
	},
} as const;

/**
 * Gets a converter function for a specific model type and output format.
 * @param modelType - The type of model to convert
 * @param outputTarget - The desired output format (must be valid per ModelToOutputMapping)
 * @returns The converter function
 */
export function getConverter<T extends ModelType, O extends ModelToOutputMapping[T]>(
	modelType: T,
	outputTarget: O,
): ConverterFunction<ModelFromType<T>, ConverterOptionsType<T, O>> {
	const modelConverters = converters[modelType];
	const converter = modelConverters[outputTarget as keyof typeof modelConverters];

	return converter as ConverterFunction<ModelFromType<T>, ConverterOptionsType<T, O>>;
}
