import type { ConversionType } from "../core/types.ts";
import * as classModel from "../models/class-model/index.ts";
import { convertToMermaidClassDiagram } from "./mermaid-class-diagram.ts";

/**
 * Specification for a single conversion.
 *
 * Determines the validation schema and a function that converts
 * validated data to the desired output format.
 */
interface ConversionSpec<TData> {
	schema: object;
	convert: (data: TData) => string;
}

/**
 * Registry of all supported conversions with their schemas and converter functions.
 * Each conversion type maps to a complete conversion specification.
 */
export const conversions = {
	"class-model-to-mermaid": {
		schema: classModel.schema,
		convert: (data: classModel.Schema) => convertToMermaidClassDiagram(data.graph),
	},
	// biome-ignore lint/suspicious/noExplicitAny: Type constraint needs flexibility for different model types
} as const satisfies Record<ConversionType, ConversionSpec<any>>;

/**
 * Extract the model data type from the conversion of a given conversion type.
 */
export type ModelOfConversion<T extends ConversionType> = T extends keyof typeof conversions
	? Parameters<(typeof conversions)[T]["convert"]>[0]
	: never;
